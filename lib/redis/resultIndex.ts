// Import the Redis client creation utility
import { createRedisClient } from './client';

// Function to create a result index in Redis
export const createResultIndex = async () => {
  const client = createRedisClient(); // Initialize Redis client

  try {
    await client.connect(); // Connect to the Redis client

    const indexName = 'idx:faq_result'; // Name of the result index

    // Check if the index already exists
    const exists = await client.ft.info(indexName).catch(() => null);

    if (exists) {
      await client.quit(); // Disconnect the client if the index exists
      return { message: 'Result index already exists.' }; // Return a message indicating the index exists
    }

    // Create the result index with the specified schema
    await client.ft.create(indexName, {
      '$.question': {
        type: 'TEXT', // Text field for the question
        AS: 'question', // Alias for easier querying
      },
      '$.answer': {
        type: 'TEXT', // Text field for the answer
        AS: 'answer',
      },
      '$.source': {
        type: 'TAG', // Tag field for the source
        AS: 'source',
      },
      '$.score': {
        type: 'NUMERIC', // Numeric field for the score
        AS: 'score',
      },
      '$.createdAt': {
        type: 'NUMERIC', // NUMERIC field for the creation date
        AS: 'createdAt',
        SORTABLE: true,
      },
    }, {
      ON: 'JSON', // Operate on JSON documents
      PREFIX: 'result:',// Prefix for keys in the index
    });

    await client.quit(); // Disconnect the client after creating the index
    return { message: `${indexName} - Result index created.` }; // Return a success message
  } catch (error) {
    console.error('Error creating result index:', error); // Log any errors
    throw new Error('Failed to create result index'); // Throw an error if index creation fails
  } finally {
    await client.quit(); // Ensure the client is disconnected
  }
};
