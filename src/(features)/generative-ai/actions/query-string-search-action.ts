'use server';
import { GenericResponse } from '@/app/types/generic-response-type';
import { ESClient } from '@/clients/elastic-search';

export const QueryStringSearchAction = async (
  indexName: string,
  searchTerm: string,
  cursor: number
): Promise<
  GenericResponse<
    unknown[],
    { cursor: number; totalDocuments: number; took: number }
  >
> => {
  const response: GenericResponse<
    unknown[],
    { cursor: number; totalDocuments: number; took: number }
  > = {
    payload: [],
    error: '',
    success: false,
    meta: {
      cursor: cursor,
      totalDocuments: 0,
      took: 0,
    },
  };

  if (indexName?.length < 1) {
    response.error = 'Index name is required';
    return response;
  }

  if (searchTerm?.length < 1) {
    response.error = 'Search term is required';
    return response;
  }

  try {
    const res = await ESClient.search({
      index: indexName,
      from: cursor,
      size: 10,
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: searchTerm, // Search term
                // fields: ['content'], // Optional, to still search in content
              },
            },
          ],
        },
      },
    });

    response.payload = res.hits.hits.map((hit) => {
      const { _source } = hit;
      const ingestedSource = _source as {
        id?: string;
        relevance_score?: number;
      };

      if (ingestedSource) {
        ingestedSource.id = hit?._id ?? '';
        ingestedSource.relevance_score = hit?._score ?? 0;
      }

      return ingestedSource;
    });

    if (response.payload.length > 1) {
      response.success = response.payload.length > 0;
      response.meta.totalDocuments =
        (res.hits?.total as { value: number }).value ?? 0;
      response.meta.took = res.took;
      response.meta.cursor = cursor + 100;
    } else {
      response.error = 'No documents found';
    }
    console.log(response);
    return response;
  } catch (error) {
    response.error = JSON.stringify(error);
    response.success = false;
    return response;
  }
};
