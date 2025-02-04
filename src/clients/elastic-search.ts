import { Client } from '@elastic/elasticsearch';

export const ESClient = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9201',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'admin',
  },
});

export const InitializeIndexes = async () => {
  const indexExists = await ESClient.indices.exists({
    index: 'ingestions',
  });

  if (!indexExists) {
    await ESClient.indices.create({
      index: 'ingestions',
      body: {
        mappings: {
          properties: {
            index_name: { type: 'keyword' },
            ingestion_description: { type: 'keyword' },
            created_at: { type: 'date' },
            files: { type: 'keyword' },
            total_documents: { type: 'integer' },
          },
        },
      },
    });
  }
};
