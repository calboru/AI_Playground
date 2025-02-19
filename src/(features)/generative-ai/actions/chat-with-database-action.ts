'use server';
import { OllamaEmbeddings } from '@langchain/ollama';
import {
  type ElasticClientArgs,
  ElasticVectorSearch,
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

const embeddings = new OllamaEmbeddings({
  model: 'mxbai-embed-large',
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

const createVectorStore = (indexName: string) => {
  const clientArgs: ElasticClientArgs = {
    client: ESClient,
    indexName: indexName,
  };
  const elasticSearchVectorStore = new ElasticVectorSearch(
    embeddings,
    clientArgs
  );
  return elasticSearchVectorStore;
};

export const ChatWithDatabaseAction = async (
  indexName: string,
  prompt: string,
  searchTerm?: string
) => {
  try {
    const vectorStore = createVectorStore(indexName);

    const filter = {};
    //CURRENTLY QUERY STRING QUERY IS NOT WORKING
    //   [
    //     {
    //       operator: 'query_string',
    //       field: null,
    //       value: searchTerm,
    //     },
    //   ];
    console.log(searchTerm);
    const llm = new Ollama({
      model: 'command-r7b', // Default value
      temperature: 0,
      maxRetries: 2,
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });

    const promptTemplate = await pull<ChatPromptTemplate>('rlm/rag-prompt');

    const ragChainWithSources = RunnableMap.from({
      // Return raw documents here for now since we want to return them at
      // the end - we'll format in the next step of the chain
      context: vectorStore.asRetriever({ filter: filter }),
      question: new RunnablePassthrough(),
    }).assign({
      answer: RunnableSequence.from([
        (input) => {
          return {
            // Now we format the documents as strings for the prompt
            context: formatDocumentsAsString(
              input.context as Document<Record<string, unknown>>[]
            ),
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
    console.log(error);
  }
};

// import { Ollama } from '@langchain/community/llms/ollama';
// import { initializeAgentExecutorWithOptions } from 'langchain/agents';
// import { Tool } from 'langchain/tools';
// import { Calculator } from 'langchain/tools/calculator';

// // Define your LLM instance
// const llm = new Ollama({
//   model: 'command-r7b',
//   temperature: 0,
//   maxRetries: 2,
//   baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
// });

// // Example: Custom Tool (Function)
// class CustomSearchTool extends Tool {
//   name = 'custom_search';
//   description = 'Search for information using a custom API.';

//   async _call(input: string) {
//     return `Searching for: ${input}`;
//   }
// }

// // Define tools (you can add multiple)
// const tools = [new Calculator(), new CustomSearchTool()];

// // Create an Agent Executor
// const agent = await initializeAgentExecutorWithOptions(tools, llm, {
//   agentType: 'zero-shot-react-description', // Define behavior
//   verbose: true,
// });

// // Run the agent with a query
// const response = await agent.call({ input: 'What is 12 * 8?' });

// console.log(response);
