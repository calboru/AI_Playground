'use server';

import { parseString } from '@fast-csv/parse';
import { faker } from '@faker-js/faker';
import { ESClient, InitializeIndexes } from '@/clients/elastic-search';
import { GenericResponse } from '@/app/types/generic-response-type';
import { IngestionType } from '../types/ingestion-type';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const BulkIndex = async (indexName: string, data: unknown[]) => {
  if (data.length === 0) return;

  try {
    // Function to split the data into chunks of 1000
    const chunkData = (data: unknown[], chunkSize: number) => {
      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      return chunks;
    };

    // Split data into chunks of 1000
    const chunks = chunkData(data, 1000);

    // Iterate over chunks and index each batch
    for (const chunk of chunks) {
      const operations = chunk.flatMap((doc: unknown) => [
        { index: { _index: indexName } },
        doc,
      ]);

      const bulkResponse = await ESClient.bulk({
        refresh: true,
        body: operations,
      });

      if (bulkResponse.errors) {
        console.error('Bulk indexing errors:', bulkResponse.items);

        throw new Error('Some documents failed to index.');
      }
    }
  } catch (error) {
    console.error('Error in BulkIndex:', JSON.stringify(error));
    throw error;
  }
};

export const BulkIndexCSVAction = async (
  ingestionDescription: string,
  ingestionFiles: File[]
): Promise<GenericResponse<IngestionType, undefined>> => {
  const response: GenericResponse<IngestionType, undefined> = {
    success: false,
    error: '',
    payload: {
      index_name: '',
      id: '',
      ingestion_description: '',
      files: [],
      created_at: '',
      total_documents: 0,
    },
    meta: undefined,
  };

  return new Promise<GenericResponse<IngestionType, undefined>>(
    async (resolve, reject) => {
      const data: unknown[] = [];
      const cleanDescription = ingestionDescription?.trim() || 'No description';
      const indexName = 'raw-' + faker.string.alpha(10).toLowerCase();
      response.payload.index_name = indexName;

      await InitializeIndexes();

      const onlyCSVFiles = ingestionFiles.filter(
        (file) => file.type === 'text/csv'
      );

      onlyCSVFiles.forEach(async (file: File) => {
        const cleanFileName = file?.name?.trim() || 'Unknown file';
        const csvText = await file.text();

        if (csvText?.length === 0) {
          response.error = 'Empty file';
          response.success = false;
          reject(response);
          return;
        }

        parseString(csvText, {
          headers: (headers) =>
            headers.map((h) => h?.toLowerCase().replace(/[^a-z0-9]/g, '_')),
        })
          .on('error', (error) => {
            console.error('CSV parsing error:', error);
            response.error = error.message;
            response.success = false;
            reject(response);
          })
          .on('data', (row) => {
            const rowWithFileName = {
              ...row,
              file_name: cleanFileName,
              index_name: indexName,
            };
            data.push(rowWithFileName);
          })
          .on('end', async () => {
            try {
              if (data.length === 0) {
                console.log('No data found in CSV.');
                response.success = false;
                response.error = 'No data found in CSV.';
                resolve(response);
                return;
              }

              await BulkIndex(indexName, data);

              await ESClient.index({
                index: 'ingestions',
                document: {
                  ingestion_description: cleanDescription,
                  files: onlyCSVFiles.map((file) => file.name),
                  index_name: indexName,
                  created_at: new Date(),
                  total_documents: data.length,
                },
              });

              console.log(
                `Successfully indexed ${data.length} records, index: ${indexName}`
              );

              await ESClient.indices.refresh({ index: indexName });

              response.success = true;
              response.payload.created_at = new Date().toLocaleString();
              response.payload.total_documents = data.length;
              response.payload.files = onlyCSVFiles.map((file) => file.name);

              await delay(3000);
              resolve(response);
            } catch (error) {
              response.error = JSON.stringify(error);
              response.success = false;

              //delete index no need to keep junk user can ingest again.
              //delete ingestion content
              await ESClient.indices.delete({ index: indexName });

              //delete ingestion project
              await ESClient.deleteByQuery({
                index: 'ingestions',
                query: {
                  match: { index_name: indexName },
                },
              });

              reject(error);
            }
          });
      });
    }
  );
};
