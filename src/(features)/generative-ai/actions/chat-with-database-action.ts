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
import {
  CleanChatHistoryPrompt,
  QuestionContextualizationPrompt,
} from '@/lib/prompts';
import { ChatEntry } from '../types/chat-entry-type';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { IRAGResponse } from '../types/rag-response-type';
import agentManager from './ollama-agents/agent';

const RAG_LLM_MODEL_NAME = process?.env?.RAG_LLM_MODEL_NAME ?? 'command-r7b';

const embeddings = new OllamaEmbeddings({
  model: 'mxbai-embed-large',
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

const createVectorStore = (indexName: string) => {
  const clientArgs: ElasticClientArgs = { client: ESClient, indexName };
  return new ElasticVectorSearch(embeddings, clientArgs);
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
  chatHistory: ChatEntry[],
  userPrompt: string
) => {
  const llm = new Ollama({
    model: RAG_LLM_MODEL_NAME,
    temperature: 0,
    maxRetries: 2,
    baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
  });

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

  const res = await llm.invoke(
    CleanChatHistoryPrompt(userPrompt, flattenedChatHistory)
  );
  console.log('CLEANED CHAT HISTORY', res);
  return res;
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

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      'system',
      `
      You are a precise, factual assistant tasked with answering the user's latest question based exclusively on the provided context, which includes documents and relevant chat history. Do not use any pre-trained knowledge or external information beyond what is explicitly given. Follow these steps:
      1. **Evaluate Context**: Review the full provided context—documents and chat history entries—and assess each item’s relevance to the question: "{question}". Assign a mental relevance score (0 to 1) based solely on how directly it delivers specific, actionable information from the context. Prioritize items that explicitly answer the question over those that are vague or off-topic within the given materials.  
      2. **Filter Relevant Items**: Select only the items from the provided context (documents and chat history) that contain clear, accurate, and directly applicable details for the question. Discard anything within the context that is unrelated, ambiguous, or unhelpful.  
      3. **Answer Concisely**: Using only the selected items from the provided context, craft a short, cohesive answer. Do not include external knowledge, assumptions, or details not present in the context.  
      4. **Handle Insufficient Context**: If the provided context contains no relevant items or lacks sufficient detail, respond: "I cannot answer your question due to insufficient or unrelated information in the provided context. Please ask something relevant to the given materials."  
      5. **Stay Brief**: Provide a clear, concise response based solely on the context, avoiding elaboration unless explicitly requested by the user.
      `,
    ],
    ['human', 'Provided Context: {context}'],
    ['human', 'Question: {question}\nAnswer:'],
  ]);

  const cleanedChatHistory = await chatHistoryCleanupChain(
    chatHistory,
    userPrompt
  );

  const ragChainWithSources = RunnableMap.from({
    context: vectorStore.asRetriever({ k: 5, filter }),
    question: new RunnablePassthrough(),
  }).assign({
    // Step 1: Call agents (if needed) based on users prompt
    answer: RunnableSequence.from([
      async (input) => {
        const contextDocs =
          (input.context as Document<Record<string, unknown>>[]) ?? [];
        const contextString = contextDocs
          .map((doc) => doc.pageContent)
          .join('\n\n');

        const toolResponses = await agentManager.invoke({
          input: userPrompt.concat('\n ').concat(contextString),
        });

        const toolResponseDoc = new Document({
          pageContent: `Tool Responses: ${toolResponses.output}`,
          metadata: {
            source: 'Agent',
          },
        });
        contextDocs.push(toolResponseDoc);

        return {
          context: contextDocs,
          question: input.question,
        };
      },
      async (input) => {
        const contextDocs =
          (input.context as Document<Record<string, unknown>>[]) ?? [];
        console.log('CONTEXT DOCS', contextDocs);

        const contextDocsString = formatDocumentsAsString(contextDocs)
          .concat('\n\n  ')
          .concat('**Chat History:**  \n\n')
          .concat(cleanedChatHistory);

        console.log({
          userPrompt,
          contextualizedPrompt,
          chatHistoryAndRetrievedContextCombinedContext: contextDocsString,
        });

        return {
          context: contextDocsString,
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
