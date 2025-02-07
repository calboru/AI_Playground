'use server';
import { ESClient, InitializeIndexes } from '@/clients/elastic-search';
import { IngestionType } from '../types/intestion-type';
import { InfinitePayload } from '@/types/infinite-payload';

export const InfiniteIngestionsAction = async (page: number) => {
  try {
    const pageSize = 10;

    const payload: InfinitePayload<IngestionType> = {
      documents: [],
      cursor: 0,
      hasMore: false,
      totalDocuments: 0,
    };

    await InitializeIndexes();

    const searchParams = {
      index: 'ingestions',
      size: pageSize,
      from: page,
      sort: [
        { created_at: { order: 'desc' } }, // Sort by created_at descending
      ],
      query: {
        match_all: {},
      },
    };

    const res = await ESClient.search(searchParams);

    const docs = res.hits.hits.map((hit) => {
      const source = hit._source as IngestionType;
      source.id = hit._id as string;
      return source;
    });

    const totalDocuments = (res.hits?.total as { value: number }).value ?? 0;

    payload.totalDocuments = totalDocuments;
    payload.documents = docs ?? [];

    payload.cursor = page + pageSize;

    payload.hasMore = payload.cursor < totalDocuments;

    console.log('Payload:', payload.cursor);
    return payload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
