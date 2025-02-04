'use server';
import { ESClient } from '@/clients/elastic-search';
import { IngestionType } from '../types/intestion-type';
import { InfinitePayload } from '@/types/infinite-payload';

export const InfiniteIngestionsAction = async (cursor: {
  id?: string | undefined;
  created_at?: Date | undefined;
}) => {
  try {
    const payload: InfinitePayload<IngestionType> = {
      documents: [],
      cursor: cursor,
      hasMore: false,
      totalDocuments: 0,
    };

    const res = await ESClient.search({
      index: 'ingestions',
      size: 10,
      sort: [
        { created_at: { order: 'desc' } },
        { index_name: { order: 'asc' } },
      ],
      search_after: [cursor.created_at, cursor.id],
      query: {
        match_all: {},
      },
    });

    const docs = res.hits.hits.map((hit) => {
      const source = hit._source as IngestionType;
      source.id = hit._id as string;
      return source;
    });

    payload.totalDocuments = (res.hits?.total as { value: number }).value ?? 0;
    payload.documents = docs ?? [];
    console.log(payload);
    return payload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
