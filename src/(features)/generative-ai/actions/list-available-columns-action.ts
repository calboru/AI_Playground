'use server';
import { GenericResponse } from '@/app/types/generic-response-type';
import { ESClient } from '@/clients/elastic-search';
import { AvailableColumnType } from '../types/available-columns-type';

export const ListAvailableColumnsAction = async (
  indexName: string
): Promise<
  GenericResponse<
    AvailableColumnType[],
    { totalDocument: number; took: number }
  >
> => {
  const response: GenericResponse<
    AvailableColumnType[],
    { totalDocument: number; took: number }
  > = {
    payload: [],
    error: '',
    success: false,
    meta: {
      totalDocument: 0,
      took: 0,
    },
  };

  if (indexName?.length < 1) {
    response.error = 'Index name is required';
    response.success = false;
    return response;
  }

  try {
    const res = await ESClient.indices.getMapping({
      index: indexName,
    });

    const properties = res[indexName]?.mappings?.properties;
    if (properties) {
      response.payload = Object.keys(properties)
        .map((key) => ({
          column_name: key,
          column_type: properties[key].type || 'unknown',
        }))
        .sort((a, b) => a.column_name.localeCompare(b.column_name));
    }

    response.success = true;
  } catch (error) {
    response.success = false;
    response.error = JSON.stringify(error);
    return response;
  }

  return response;
};
