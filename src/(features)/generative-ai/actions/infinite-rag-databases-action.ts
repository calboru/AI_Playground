'use server';
import { ESClient } from '@/clients/elastic-search';
import { InfinitePayload } from '@/types/infinite-payload';
import { RAGDatabaseType } from '../types/rag-database-type';

export const InfiniteRAGDatabasesAction = async (page: number) => {
  try {
    const pageSize = 10;

    const payload: InfinitePayload<RAGDatabaseType> = {
      documents: [],
      cursor: 0,
      hasMore: false,
      totalDocuments: 0,
    };

    const indexExists = await ESClient.indices.exists({
      index: 'rag-index',
    });
    if (!indexExists) {
      return payload;
    }

    const searchParams = {
      index: 'rag-index',
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
      const source = hit._source as RAGDatabaseType;
      source.id = hit._id as string;
      return source;
    });

    const totalDocuments = (res.hits?.total as { value: number }).value ?? 0;

    payload.totalDocuments = totalDocuments;
    payload.documents = docs ?? [];

    payload.cursor = page + pageSize;

    payload.hasMore = payload.cursor < totalDocuments;

    return payload;
  } catch (error) {
    throw error;
  }
};
