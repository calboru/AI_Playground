import { z } from 'zod';
import { Document } from '@langchain/core/documents';
import { Tool } from '../../types/tool-lama-types';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { WebSearchPromptTemplate } from '@/lib/prompts';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const WebSearchInputSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt must not be empty'),
});
export type WebSearchInputType = z.infer<typeof WebSearchInputSchema>;

const SEARXNG_URL = process?.env?.SEARXNG_URL ?? 'http://localhost:8080';
const RAG_LLM_MODEL_NAME = process?.env?.RAG_LLM_MODEL_NAME ?? 'command-r7b';

const LLM_PROVIDERS_WITH_LATEST_DATA =
  process?.env?.LLM_PROVIDERS_WITH_LATEST_DATA ?? 'phi4'; //,granite3.2,dolphin3

// Initial prompt template for generating the search phrase
const askLLMPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Analyze the user's prompt and return a brief, one-paragraph summary capturing its main intent.`,
  ],
  ['user', '{userPrompt}'],
]);

const AskLLMProvidersWithLatestData = async (
  userPrompt: string
): Promise<Document<Record<string, unknown>>[]> => {
  const docs: Document<Record<string, unknown>>[] = [];

  const llm = new ChatOllama({
    model: RAG_LLM_MODEL_NAME,
    temperature: 0,
    maxRetries: 2,
    baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
  });

  for (const provider of LLM_PROVIDERS_WITH_LATEST_DATA.split(',')) {
    try {
      const response = await askLLMPrompt.pipe(llm).invoke({ userPrompt });

      const doc = new Document<Record<string, unknown>>({
        pageContent: response.content as string,
        metadata: {
          source: `LLMProvider-${provider}`,
        },
      });
      docs.push(doc);
    } catch (error) {
      console.error(`Unable to fetch data from ${provider}:`, error);
    }
  }
  return docs;
};

const SearXNGTool = async (
  prompt: string
): Promise<Document<Record<string, unknown>>[]> => {
  const docs: Document<Record<string, unknown>>[] = [];

  try {
    const searchParams = new URLSearchParams({
      q: prompt,
      format: 'json', // Request JSON output
    });

    const response = await fetch(`${SEARXNG_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams.toString(),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Map SearXNG results to Document objects
        data.results.map(
          (item: {
            content: string;
            title: string;
            url: string;
            score: number;
            engines: string[];
            publishedDate: string;
          }) => {
            const doc = new Document<Record<string, unknown>>({
              pageContent: item?.content || 'No content available', // Use content field
              metadata: {
                source: `WebSearchTool`,
                title: item?.title || 'Untitled',
                url: item?.url || 'No URL',
                engines: (item?.engines ?? []).join(', '),
                publishedDate: item?.publishedDate,
              },
            });
            docs.push(doc);
          }
        );
      }
    }
    const llmResponseDocs = await AskLLMProvidersWithLatestData(prompt);
    return [...docs, ...llmResponseDocs];
  } catch (error) {
    console.error('Unable to fetch search results from SearXNG:', error);
    return [];
  }
};

export const BaseWebSearchToolWithAI = async (
  userPrompt: string
): Promise<{
  question: string;
  answer: string;
  context: Document<Record<string, unknown>>[];
}> => {
  try {
    const searchResultDocuments = await SearXNGTool(userPrompt);

    const embeddings = new OllamaEmbeddings({
      model: process?.env?.EMBEDDING_MODEL ?? 'mxbai-embed-large',
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(searchResultDocuments);

    /*This vector store also supports maximal marginal relevance (MMR), a technique that first fetches a larger number of results (given by searchKwargs.fetchK),
     with classic similarity search, then reranks for diversity and returns the top k results. This helps guard against redundant information:  
    */
    const mmrRetriever = vectorStore.asRetriever({
      searchType: 'mmr',
      searchKwargs: {
        fetchK: 10,
      },
      k: 5,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', WebSearchPromptTemplate()],
      ['human', '{question}'],
      ['human', '{context}'],
    ]);

    const llm = new ChatOllama({
      model: RAG_LLM_MODEL_NAME,
      temperature: 0,
      maxRetries: 2,
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

    const ragChainWithSources = RunnableMap.from({
      context: mmrRetriever,
      question: new RunnablePassthrough(),
    }).assign({
      answer: RunnableSequence.from([
        async (input) => {
          const contextDocs =
            (input.context as Document<Record<string, unknown>>[]) ?? [];
          const contextString = contextDocs.map((doc) => doc.pageContent);

          return {
            context: contextString,
            question: input.question,
          };
        },
        promptTemplate,
        llm,
        new StringOutputParser(),
      ]),
    });

    return (await ragChainWithSources.invoke(userPrompt)) as {
      question: string;
      answer: string;
      context: Document<Record<string, unknown>>[];
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export class WebSearchTool implements Tool<WebSearchInputType> {
  public name = 'WebSearchTool';
  public description =
    'Performs a web search using based on users prompt. Expects {{prompt: string}}';
  public inputSchema: z.ZodType<WebSearchInputType> =
    WebSearchInputSchema as z.ZodType<WebSearchInputType>;

  async invoke(
    input: WebSearchInputType
  ): Promise<Document<Record<string, unknown>>[]> {
    const parsedInput = this.inputSchema.safeParse(input);
    if (!parsedInput.success) {
      const errorMessage = `Invalid input: ${parsedInput.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`;
      console.error(`Invalid argument for WebSearchTool: ${errorMessage}`);
      return [];
    }

    const { prompt } = parsedInput.data;
    const response = await BaseWebSearchToolWithAI(prompt);
    return response.context;
  }
}
