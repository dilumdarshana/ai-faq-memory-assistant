import { createRedisClient } from './client';

export const createResultIndex = async () => {
  const client = createRedisClient();

  try {
    await client.connect();

    const indexName = 'idx:faq_result';
    const exists = await client.ft.info(indexName).catch(() => null);

    if (exists) {
      await client.quit();
      return { message: 'Result index already exists.' };
    }

    await client.ft.create(indexName, {
      '$.question': {
        type: 'TEXT',
        AS: 'content'
      },
      '$.answer': {
        type: 'TEXT',
        AS: 'answer',
      },
      '$.source': {
        type: 'TAG',
        AS: 'source'
      },
      '$.score': {
        type: 'NUMERIC',
        AS: 'score'
      },
      '$.createdAt': {
        type: 'TEXT',
        AS: 'createdAt'
      },
    }, {
      ON: 'JSON',
      PREFIX: 'result:'
    });

    await client.quit();
    return { message: `${indexName} - Result index created.` };
  } catch (error) {
    console.error('Error creating result index:', error);
    throw new Error('Failed to create result index');
  } finally {
    await client.quit();
  }
};
