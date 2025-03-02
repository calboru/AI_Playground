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
import { Ollama, ChatOllama } from '@langchain/ollama';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import { Document } from '@langchain/core/documents';
import { AskLLMAction } from './ask-llm-action';
import { CurrencyConverterTool } from './ollama-agents/agents';
import {
  QuestionContextualizationPrompt,
  ToolInvokingPrompt,
} from '@/lib/prompts';
import { ChatEntry } from '../types/chat-entry-type';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { IRAGResponse } from '../types/rag-response-type';

const RAG_LLM_MODEL_NAME = process?.env?.RAG_LLM_MODEL_NAME ?? 'command-r7b';

const embeddings = new OllamaEmbeddings({
  model: 'mxbai-embed-large',
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

const createVectorStore = (indexName: string) => {
  const clientArgs: ElasticClientArgs = { client: ESClient, indexName };
  return new ElasticVectorSearch(embeddings, clientArgs);
};

const agentChain = async (
  userPrompt: string
): Promise<Document<Record<string, unknown>>[]> => {
  const instruction = ToolInvokingPrompt(userPrompt);
  const toolResponseDocuments: Document<Record<string, unknown>>[] = [];
  const res2 = (await AskLLMAction(
    'llama3.2',
    instruction,
    [CurrencyConverterTool],
    false,
    true
  )) as string[];

  console.log('AGENT CALL RESPONSE', res2);

  for (const response of res2) {
    toolResponseDocuments.push({
      pageContent: response,
      metadata: {
        source: 'Ollama Agent',
      },
    });
  }
  return toolResponseDocuments;
};

const questionContextualizationChain = async (
  userPrompt: string,
  chatHistory: ChatEntry[]
): Promise<string> => {
  const llm = new Ollama({
    model: RAG_LLM_MODEL_NAME,
    temperature: 0,
    maxRetries: 2,
    baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
  });

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ['system', QuestionContextualizationPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{question}'],
  ]);
  const contextualizeQChain = contextualizeQPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  const augmentedChatHistory = chatHistory
    .map((entry) => {
      const result = [];
      result.push(new HumanMessage(entry.prompt));
      result.push(new AIMessage(entry.response));
      return result;
    })
    .flat();

  const conceptualizedPrompt = await contextualizeQChain.invoke({
    chat_history: augmentedChatHistory,
    question: userPrompt,
  });

  return conceptualizedPrompt;
};

const chatHistoryCleanupChain = async (
  llm: ChatOllama,
  chatHistory: ChatEntry[],
  userPrompt: string
) => {
  const flattenedChatHistory =
    Array.from(
      chatHistory
        .reduce((map, entry) => {
          // Use prompt as the key, overwrite with the latest entry
          map.set(entry.prompt, entry);
          return map;
        }, new Map<string, ChatEntry>())
        .values() // Get deduplicated entries
    )
      .map((entry) => ({ system: entry.prompt, human: entry.response }))
      .map((entry) => `System: ${entry.system}\nHuman: ${entry.human}`)
      .join('\n\n') ?? '';

  const cleanChatHistoryPrompt = `Based on the latest user's prompt, filter the chat history to remove all entries unrelated to it. Preserve the exact format of the chat history, including carriage returns, as provided. If no entries are relevant, return an empty response ("").
  Latest user's prompt: ${userPrompt}
  Chat history: ${flattenedChatHistory}`;
  const res = await llm.invoke(cleanChatHistoryPrompt);
  return res.content.toString();
};

const retrievalAugmentedGenerationChainWithSources = async (
  llm: ChatOllama,
  indexName: string,
  userPrompt: string,
  searchTerm?: string,
  chatHistory: ChatEntry[] = [],
  stream = true
): Promise<IterableReadableStream<unknown> | IRAGResponse | null> => {
  const filter = searchTerm
    ? [{ operator: 'match', field: 'text', value: searchTerm }]
    : {};
  console.log('filter', filter);
  const vectorStore = createVectorStore(indexName);

  const contextualizedPrompt = await questionContextualizationChain(
    userPrompt,
    chatHistory
  );

  const toolResponseDocuments = await agentChain(contextualizedPrompt);

  // Replace the default rlm/rag-prompt with the improved custom prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      `
      You are a precise, factual assistant tasked with answering the user's latest question based solely on the provided context, which includes documents and relevant chat history. Follow these steps:

      1. **Evaluate Context**: Review the full context—documents and chat history entries—and assess each item's relevance to the question: "{question}". Mentally score relevance (0 to 1) based on how directly it provides specific, actionable information. Prioritize items that explicitly address the question over vague or unrelated content.  
      2. **Filter Relevant Items**: Select only the most relevant items (documents and chat history) that offer clear, accurate details for the question. Discard anything unrelated, ambiguous, or unhelpful.  
      3. **Answer Concisely**: Using only the selected items, provide a short, cohesive answer. Do not add external knowledge, assumptions, or unnecessary details beyond the context.  
      4. **Handle Insufficient Context**: If no items are relevant or lack sufficient detail, respond: "I cannot answer your question due to insufficient or unrelated context. Please ask something relevant to the provided information."  
      5. **Stay Brief**: Deliver a clear, concise response without elaboration unless specifically requested.  
      `,
    ],
    ['human', 'Context: {context}\nQuestion: {question}\nAnswer:'],
  ]);

  const cleanedChatHistory = await chatHistoryCleanupChain(
    llm,
    chatHistory,
    userPrompt
  );

  const ragChainWithSources = RunnableMap.from({
    context: vectorStore.asRetriever({ k: 5, filter }),
    question: new RunnablePassthrough(),
  }).assign({
    answer: RunnableSequence.from([
      async (input) => {
        const contextDocs =
          (input.context as Document<Record<string, unknown>>[]) ?? [];

        return {
          context: formatDocumentsAsString([
            ...toolResponseDocuments,
            ...contextDocs,
          ])
            .concat('\n\n  ')
            .concat('**Chat History:**  \n\n')
            .concat(cleanedChatHistory),

          question: input.question,
        };
      },
      promptTemplate,
      llm,
      new StringOutputParser(),
    ]),
  });

  if (stream) {
    return ragChainWithSources.stream(contextualizedPrompt);
  } else {
    return ragChainWithSources.invoke(contextualizedPrompt);
  }
};

export const ChatWithDatabaseAction = async (
  indexName: string,
  prompt: string,
  selectedLLM: string,
  searchTerm?: string,
  chatHistory: ChatEntry[] = []
): Promise<ReadableStream<Uint8Array> | undefined> => {
  try {
    const llm = new ChatOllama({
      model: selectedLLM,
      temperature: 0,
      maxRetries: 2,
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

    console.log('SELECTED LLM', selectedLLM);

    const chainResponse = await retrievalAugmentedGenerationChainWithSources(
      llm,
      indexName,
      prompt,
      searchTerm,
      chatHistory,
      true
    );

    return new ReadableStream({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        for await (const chunk of chainResponse as IterableReadableStream<unknown>) {
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
