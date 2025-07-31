import { createRedisClient } from './client';

export const createVectorIndex = async () => {
  const client = createRedisClient();

  try {
    await client.connect();

    const indexName = 'idx:faq_vector';
    const exists = await client.ft.info(indexName).catch(() => null);

    if (exists) {
      await client.quit();
      return { message: 'Vector index already exists.' };
    }

    await client.ft.create(indexName, {
      '$.question': {
        type: 'TEXT',
        AS: 'question'
      },
      '$.answer': {
        type: 'TEXT',
        AS: 'answer',
      },
      '$.embedding': {
        type: 'VECTOR',
        TYPE: 'FLOAT32',
        ALGORITHM: 'HNSW',
        DISTANCE_METRIC: 'COSINE',
        DIM: 1536, // Embedding dimensions
        AS: 'embedding'
      }
    }, {
      ON: 'JSON',
      PREFIX: 'vector:'
    });

    return { message: `${indexName} - Vector index created.` };
  } catch (error) {
    console.error('Error creating vector index:', error);
    throw new Error('Failed to create vector index');
  } finally {
    await client.quit();
  }
};
