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
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { pull } from 'langchain/hub';
import { Document } from '@langchain/core/documents';
import { AskLLMAction } from './ask-llm-action';
import { CurrencyConverterTool } from './ollama-agents/agents';
import {
  ChatWithDatabasePrompt,
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

const retrievalAugmentedGenerationChainWithSources = async (
  llm: Ollama,
  indexName: string,
  userPrompt: string,
  searchTerm?: string,
  chatHistory: ChatEntry[] = [],
  stream = true
): Promise<IterableReadableStream<unknown> | IRAGResponse | null> => {
  const filter = searchTerm
    ? [{ operator: 'match', field: 'text', value: searchTerm }]
    : {};

  const vectorStore = createVectorStore(indexName);

  const contextualizedPrompt = await questionContextualizationChain(
    userPrompt,
    chatHistory
  );

  const toolResponseDocuments = await agentChain(contextualizedPrompt);

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

  const wrappedPrompt = ChatWithDatabasePrompt(contextualizedPrompt);

  if (stream) {
    return ragChainWithSources.stream(wrappedPrompt);
  } else {
    return ragChainWithSources.invoke(wrappedPrompt);
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
    const llm = new Ollama({
      model: selectedLLM,
      temperature: 0,
      maxRetries: 2,
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

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
