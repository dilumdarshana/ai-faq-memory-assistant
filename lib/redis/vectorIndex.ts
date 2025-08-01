// Import the Redis client creation utility
import { createRedisClient } from './client';

// Function to create a vector index in Redis
export const createVectorIndex = async () => {
  const client = createRedisClient(); // Initialize Redis client

  try {
    await client.connect(); // Connect to the Redis client

    const indexName = 'idx:faq_vector'; // Name of the vector index

    // Check if the index already exists
    const exists = await client.ft.info(indexName).catch(() => null);

    if (exists) {
      await client.quit(); // Disconnect the client if the index exists
      return { message: 'Vector index already exists.' }; // Return a message indicating the index exists
    }

    // Create the vector index with the specified schema
    await client.ft.create(indexName, {
      '$.question': {
        type: 'TEXT', // Text field for the question
        AS: 'question', // Alias for easier querying
      },
      '$.answer': {
        type: 'TEXT', // Text field for the answer
        AS: 'answer',
      },
      '$.embedding': {
        type: 'VECTOR', // Vector field for embeddings
        TYPE: 'FLOAT32', // Data type of the vector
        ALGORITHM: 'HNSW', // Algorithm for vector similarity search
        DISTANCE_METRIC: 'COSINE', // Metric for measuring similarity
        DIM: 1536, // Embedding dimensions
        AS: 'embedding', // Alias for easier querying
      },
    }, {
      ON: 'JSON', // Operate on JSON documents
      PREFIX: 'vector:', // Prefix for keys in the index
    });

    return { message: `${indexName} - Vector index created.` }; // Return a success message
  } catch (error) {
    console.error('Error creating vector index:', error); // Log any errors
    throw new Error('Failed to create vector index'); // Throw an error if index creation fails
  } finally {
    await client.quit(); // Ensure the client is disconnected
  }
};
