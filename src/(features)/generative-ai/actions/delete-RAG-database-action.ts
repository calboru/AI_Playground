'use server';
import { ESClient } from '@/clients/elastic-search';

export const DeleteRAGDatabaseAction = async (indexName: string) => {
  console.log('Deleting RAG database called', indexName);
  try {
    const indexExists = await ESClient.indices.exists({ index: indexName });
    if (indexExists) {
      await ESClient.indices.delete({ index: indexName });

      await ESClient.deleteByQuery({
        index: 'rag-index',
        body: {
          query: {
            match: {
              rag_index_name: indexName,
            },
          },
        },
      });
      ESClient.indices.refresh({ index: 'rag-index' });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
