'use server';

import { OllamaEmbeddings } from '@langchain/ollama';
import {
  ElasticVectorSearch,
  type ElasticClientArgs,
} from '@langchain/community/vectorstores/elasticsearch';
import { ESClient } from '@/clients/elastic-search';
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { formatDocumentsAsString } from 'langchain/util/document';
import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { pull } from 'langchain/hub';
import { Document } from '@langchain/core/documents';
import { AskLLMAction } from './ask-llm-action';
import { ExchangeRateAgent } from './ollama-agents/agents';

const embeddings = new OllamaEmbeddings({
  model: 'mxbai-embed-large',
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

const createVectorStore = (indexName: string) => {
  const clientArgs: ElasticClientArgs = { client: ESClient, indexName };
  return new ElasticVectorSearch(embeddings, clientArgs);
};

export const ChatWithDatabaseAction = async (
  indexName: string,
  prompt: string,
  selectedLLM: string,
  searchTerm?: string
): Promise<ReadableStream<Uint8Array> | undefined> => {
  try {
    const vectorStore = createVectorStore(indexName);
    const filter = searchTerm
      ? [{ operator: 'match', field: 'text', value: searchTerm }]
      : {};

    // Base instruction with prompt moved to the end
    const instruction = `Analyze the user's prompt to determine if it requires Ollama tools/agents to respond User's prompt: "${prompt}"`;

    const res2 = (await AskLLMAction(
      'llama3.2', // Or 'llama3.2' if available
      instruction,
      [ExchangeRateAgent],
      false,
      true
    )) as string[];

    console.log('AGENT CALL RESPONSE', res2);

    const toolResponseDocuments: Document<Record<string, unknown>>[] = [];

    for (const response of res2) {
      toolResponseDocuments.push({
        pageContent: response,
        metadata: {
          source: 'Ollama Agent',
        },
      });
    }

    const llm = new Ollama({
      model: selectedLLM,
      temperature: 0,
      maxRetries: 2,
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

    const promptTemplate = await pull<ChatPromptTemplate>('rlm/rag-prompt');
    const ragChainWithSources = RunnableMap.from({
      context: vectorStore.asRetriever(
        { filter },
        { k: 10, includeMetadata: true }
      ),
      question: new RunnablePassthrough(),
    }).assign({
      answer: RunnableSequence.from([
        (input) => {
          const contextDocs = input.context as Document<
            Record<string, unknown>
          >[];
          const allDocs = [...contextDocs, ...toolResponseDocuments];

          return {
            context: formatDocumentsAsString(allDocs),
            question: input.question,
          };
        },
        promptTemplate,
        llm,
        new StringOutputParser(),
      ]),
    });

    const chainResponse = await ragChainWithSources.stream(prompt);

    return new ReadableStream({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        for await (const chunk of chainResponse) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(chunk)));
        }
        controller.close();
      },
    });
  } catch (error) {
    console.error('Error in ChatWithDatabaseAction:', error);
    return undefined;
  }
};
