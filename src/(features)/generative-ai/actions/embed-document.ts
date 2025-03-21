'use server';

import { OllamaEmbeddings } from '@langchain/ollama';
import {
  type ElasticClientArgs,
  ElasticVectorSearch,
} from '@langchain/community/vectorstores/elasticsearch';
import { Document } from '@langchain/core/documents';
import { ESClient } from '@/clients/elastic-search';
import { jsonToMarkdown } from './convert-json-to-markdown';
import { EmbeddingEventType } from '@/types/embedding-event-type';
import { faker } from '@faker-js/faker';
import { CurationAction } from './curation-action';

const updateRAGIndex = async (
  indexName: string,
  ingestionDescription: string
) => {
  try {
    const uniqueIndexName = indexName.split('-')[1];
    const ragIndexName = `rag-${uniqueIndexName}`;

    const ragIndexExists = await ESClient.indices.exists({
      index: 'rag-index',
    });

    if (!ragIndexExists) {
      await ESClient.indices.create({
        index: 'rag-index',
        body: {
          mappings: {
            properties: {
              ingestion_description: { type: 'keyword' },
              raw_index_name: { type: 'keyword' },
              rag_index_name: { type: 'keyword' },
              created_at: { type: 'date' },
            },
          },
        },
      });
    }

    await ESClient.update({
      index: 'rag-index',
      id: ragIndexName,
      doc: {
        ingestion_description: ingestionDescription,
        rag_index_name: ragIndexName,
        raw_index_name: indexName,
        created_at: new Date(),
      },
      doc_as_upsert: true,
    });
    console.log('upserting....');
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// const DeleteDocumentsOfFailedEmbedding = async (
//   indexName: string,
//   transactionId: string
// ) => {
//   try {
//     await ESClient.deleteByQuery({
//       index: indexName,
//       body: {
//         query: {
//           match: {
//             transaction_id: transactionId,
//           },
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Error in deleteFailedDocumentsOfSession:', error);
//     throw error;
//   }
// };

const createVectorStore = async (indexName: string) => {
  try {
    const uniqueIndexName = indexName.split('-')[1];
    const aiIndexName = `rag-${uniqueIndexName}`;

    const indexExists = await ESClient.indices.exists({
      index: aiIndexName,
    });

    if (!indexExists) {
      await ESClient.indices.create({
        index: aiIndexName,
        body: {
          mappings: {
            properties: {
              embedding: {
                type: 'dense_vector',
                // dims: 2048,
                index: true,
                similarity: 'cosine',
                // index_options: {
                //   type: 'hnsw',
                //   ef_construction: 100,
                //   m: 16
                // }
              },
              text: {
                type: 'text',
              },
              content: {
                type: 'text',
              },
            },
          },
        },
      });
    }

    const embeddings = new OllamaEmbeddings({
      model: 'mxbai-embed-large',
      baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
    });
    const clientArgs: ElasticClientArgs = {
      client: ESClient,
      indexName: aiIndexName,
    };
    const elasticSearchVectorStore = new ElasticVectorSearch(
      embeddings,
      clientArgs
    );
    return elasticSearchVectorStore;
  } catch (error) {
    console.error('Error in createVectorStore:', error);
    throw error;
  }
};

const PublishEmbeddingEvent = (
  event: EmbeddingEventType,
  controller: ReadableStreamDefaultController<Uint8Array>
) => {
  controller.enqueue(new TextEncoder().encode(JSON.stringify(event)));
};

//not working replace with class
const cloneEmbeddingEvent = (
  originalEvent: EmbeddingEventType
): EmbeddingEventType => {
  return { ...originalEvent }; // Shallow copy or deep copy depending on your needs
};

const curateWithUserPrompt = async (
  markdownText: string,
  userPrompt: string
) => {
  if (userPrompt?.trim() === '') {
    return markdownText;
  }
  const updatedMarkdownText = await CurationAction(markdownText, userPrompt);

  return updatedMarkdownText;
};

export const EmbedAllDocumentsAction = async (
  searchTerm: string,
  userPompt: string,
  llmModel: string,
  indexName: string,
  indexDescription: string,
  selectedColumns: string[]
) => {
  const embeddingEventTemplate: EmbeddingEventType = {
    message: 'Embedding all documents',
    originalContent: '',
    curatedContent: '',
    finished: false,
    startDate: new Date(),
    endDate: null,
    error: '',
    failed: false,
    totalDocument: 0,
    currentDocumentIndex: 0,
  };

  return new ReadableStream({
    async start(controller: ReadableStreamDefaultController<Uint8Array>) {
      if (selectedColumns.length === 0) {
        const embeddingEvent = cloneEmbeddingEvent(embeddingEventTemplate);
        embeddingEvent.error = 'No columns selected for embedding';
        embeddingEvent.finished = true;
        embeddingEvent.endDate = new Date();
        embeddingEvent.failed = true;
        PublishEmbeddingEvent(embeddingEvent, controller);
        controller.close();
        return;
      }

      const embeddingEvent = cloneEmbeddingEvent(embeddingEventTemplate);
      PublishEmbeddingEvent(embeddingEvent, controller);
      let cursor = 0;
      let currentDocumentIndex = 0;

      const transactionId = faker.string.alpha(10).toLowerCase();

      try {
        const batchSize = 10;
        const vectorStore = await createVectorStore(indexName);

        while (true) {
          const res = await ESClient.search({
            index: indexName,
            from: cursor,
            size: batchSize,
            query: {
              bool: {
                must: [{ query_string: { query: searchTerm } }],
              },
            },
          });

          embeddingEvent.totalDocument = res.hits.total
            ? typeof res.hits.total === 'object'
              ? res.hits.total.value
              : res.hits.total
            : 0;

          const hits = res.hits.hits;
          if (hits.length === 0) {
            break;
          }

          const responses: Document<Record<string, unknown>>[] = [];

          for (const hit of hits) {
            currentDocumentIndex += 1;
            embeddingEvent.currentDocumentIndex = currentDocumentIndex;
            embeddingEvent.message = `Embedding document ${currentDocumentIndex} of ${embeddingEvent.totalDocument}`;

            const { _source } = hit;
            const markdownText = jsonToMarkdown(_source, selectedColumns);

            const curatedOrOriginalContent = await curateWithUserPrompt(
              markdownText,
              userPompt
            );

            const embeddingEventForDocument =
              cloneEmbeddingEvent(embeddingEvent);
            embeddingEventForDocument.originalContent = markdownText;
            embeddingEventForDocument.curatedContent = curatedOrOriginalContent;

            responses.push(
              new Document<Record<string, unknown>>({
                pageContent: curatedOrOriginalContent,
                metadata: {
                  transaction_id: transactionId,
                  ...(hit._source as Record<string, unknown>),
                },
              })
            );

            PublishEmbeddingEvent(embeddingEventForDocument, controller);
          }
          console.log('RESPONSES TO EMBED', responses);

          await vectorStore.addDocuments(responses);

          cursor += hits.length;
        }

        // RAG database index update/insert
        updateRAGIndex(indexName, indexDescription);
      } catch (error) {
        console.error(error);
        const embeddingEvent = cloneEmbeddingEvent(embeddingEventTemplate);
        embeddingEvent.error = JSON.stringify(error);
        embeddingEvent.finished = true;
        embeddingEvent.endDate = new Date();
        embeddingEvent.failed = true;
        PublishEmbeddingEvent(embeddingEvent, controller);
        controller.close();
      } finally {
        const embeddingEvent = cloneEmbeddingEvent(embeddingEventTemplate);
        embeddingEvent.finished = true;
        embeddingEvent.endDate = new Date();
        embeddingEvent.message = 'All documents embedded successfully';
        PublishEmbeddingEvent(embeddingEvent, controller);
      }
    },
  });
};
