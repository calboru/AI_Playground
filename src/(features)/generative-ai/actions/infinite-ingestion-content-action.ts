'use server';
import { ESClient, InitializeIndexes } from '@/clients/elastic-search';
import { IngestionType } from '../types/intestion-type';
import { InfinitePayload } from '@/types/infinite-payload';

export const InfiniteIngestionContentAction = async (
  page: number,
  indexName: string
) => {
  try {
    const pageSize = 100;

    console.log('this is the index name', indexName);
    const payload: InfinitePayload<unknown> = {
      documents: [],
      cursor: 0,
      hasMore: true,
      totalDocuments: 0,
    };

    await InitializeIndexes();
    await ESClient.indices.refresh({ index: indexName });

    const searchParams = {
      index: indexName,
      size: pageSize,
      from: page,
      query: {
        match_all: {},
      },
    };

    const res = await ESClient.search(searchParams);
    const totalDocuments = (res.hits?.total as { value: number }).value ?? 0;

    const docs = res.hits.hits.map((hit) => {
      const source = hit._source as IngestionType;
      source.id = hit._id as string;
      return source;
    });

    payload.totalDocuments = totalDocuments;
    payload.documents = docs ?? [];

    payload.cursor = page + pageSize;

    payload.hasMore = payload.cursor < totalDocuments;

    return payload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
