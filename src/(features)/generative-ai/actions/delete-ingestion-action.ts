'use server';
import { ESClient } from '@/clients/elastic-search';

export const DeleteIngestionAction = async (indexName: string) => {
  try {
    const indexExists = await ESClient.indices.exists({ index: indexName });
    if (indexExists) {
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
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
