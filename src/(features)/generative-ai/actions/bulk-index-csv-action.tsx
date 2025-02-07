'use server';

import { parseString } from '@fast-csv/parse';
import { faker } from '@faker-js/faker';
import { ESClient, InitializeIndexes } from '@/clients/elastic-search';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const BulkIndex = async (indexName: string, data: unknown[]) => {
  if (data.length === 0) return;

  try {
    const operations = data.flatMap((doc: unknown) => [
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
  } catch (error) {
    console.error('Error in BulkIndex:', error);
    throw error;
  }
};

export const BulkIndexCSVAction = async (
  ingestionDescription: string,
  ingestionFiles: File[]
): Promise<{ success: boolean; error: string; indexName: string }> => {
  const payload = {
    success: false,
    error: '',
    indexName: '',
  };

  return new Promise<{ success: boolean; error: string; indexName: string }>(
    async (resolve, reject) => {
      const data: unknown[] = [];
      const cleanDescription = ingestionDescription?.trim() || 'No description';
      const indexName = 'raw-' + faker.string.alpha(10).toLowerCase();
      payload.indexName = indexName;

      await InitializeIndexes();

      const onlyCSVFiles = ingestionFiles.filter(
        (file) => file.type === 'text/csv'
      );

      onlyCSVFiles.forEach(async (file: File) => {
        const cleanFileName = file?.name?.trim() || 'Unknown file';
        const csvText = await file.text();

        //TODO: more error handling needed
        if (csvText?.length === 0) return;

        parseString(csvText, {
          headers: (headers) =>
            headers.map((h) => h?.toLowerCase().replace(/[^a-z0-9]/g, '_')),
        })
          .on('error', (error) => {
            console.error('CSV parsing error:', error);
            payload.error = error.message;
            payload.success = false;
            reject(payload);
          })
          .on('data', (row) => {
            const rowWithFileName = { ...row, file_name: cleanFileName };
            data.push(rowWithFileName);
          })
          .on('end', async () => {
            try {
              if (data.length === 0) {
                console.log('No data found in CSV.');
                payload.success = false;
                payload.error = 'No data found in CSV.';
                resolve(payload);
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
              await delay(1000);
              payload.success = true;
              resolve(payload);
            } catch (error) {
              payload.error = JSON.stringify(error);
              payload.success = false;

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
