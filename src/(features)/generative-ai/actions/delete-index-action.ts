'use server';
import { ESClient } from '@/clients/elastic-search';

export const DeleteIndexAction = async (indexName: string) => {
  try {
    await ESClient.indices.delete({ index: indexName });
    await ESClient.deleteByQuery({
      index: 'ingestions',
      body: {
        query: {
          match: {
            index_name: indexName,
          },
        },
      },
    });
    ESClient.indices.refresh({ index: 'ingestions' });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
