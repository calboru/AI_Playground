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

export const BulkIndex = async (
  indexName: string,
  data: unknown[],
  reject: (error?: unknown) => void
) => {
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
      const errors = bulkResponse.items.filter((item) => item.index?.error);
      console.error('Bulk indexing errors:', errors);
      await esClient.indices.delete({ index: indexName });
      reject('Failed to index records: ' + JSON.stringify(errors));
      return;
    }
  } catch (error) {
    console.error('Error processing row:', error);
    reject(error); // Reject on any error in data processing
  }
};

export const BulkIndexCSVAction = async (
  ingestionDescription: string,
  fileName: string,
  csvText: string
): Promise<boolean> => {
  try {
    const data: unknown[] = [];

    const cleanDescription = ingestionDescription?.trim() || 'No description';
    const cleanFileName = fileName?.trim() || 'Unknown file';
    const indexName = faker.string.alpha(10).toLowerCase();
    console.log('Index name:', indexName);

    await new Promise<boolean>(async (resolve, reject) => {
      parseString(csvText, {
        headers: (headers) =>
          headers.map((h) => h?.toLowerCase().replace(/[^a-z0-9]/g, '_')),
      })
        .on('error', (error) => {
          console.log(error);
          reject(error);
        })
        .on('data', async (row) => {
          data.push(row);
        })
        .on('end', async () => {
          await BulkIndex(indexName, data, reject);
          // Index metadata about the ingestion process
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
          resolve(true);
        });
    });

    console.log('Bulk indexing completed successfully.');

    return true;
  } catch (error) {
    console.error('Bulk indexing failed:', error);
    throw error;
  }
};
