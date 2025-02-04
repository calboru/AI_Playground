'use server';
import { Client } from '@elastic/elasticsearch';
import { parseString } from '@fast-csv/parse';
import { faker } from '@faker-js/faker';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9201',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'admin',
  },
});

const BulkIndex = async (indexName: string, data: unknown[]) => {
  if (data.length === 0) return;

  try {
    const operations = data.flatMap((doc: unknown) => [
      { index: { _index: indexName } },
      doc,
    ]);

    const bulkResponse = await esClient.bulk({
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
  fileName: string,
  csvText: string
): Promise<{ success: boolean; error: string; indexName: string }> => {
  const payload = {
    success: false,
    error: '',
    indexName: '',
  };

  return new Promise<{ success: boolean; error: string; indexName: string }>(
    (resolve, reject) => {
      const data: unknown[] = [];
      const cleanDescription = ingestionDescription?.trim() || 'No description';
      const cleanFileName = fileName?.trim() || 'Unknown file';
      const indexName = faker.string.alpha(10).toLowerCase();

      payload.indexName = indexName;

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
          data.push(row);
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

            await esClient.index({
              index: 'ingestions',
              document: {
                ingestion_description: cleanDescription,
                file_name: cleanFileName,
                index_name: indexName,
                created_at: new Date(),
                total_documents: data.length,
              },
            });

            console.log(
              `Successfully indexed ${data.length} records, index: ${indexName}`
            );
            payload.success = true;
            resolve(payload);
          } catch (error) {
            reject(error);
          }
        });
    }
  );
};
