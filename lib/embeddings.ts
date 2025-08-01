// Import necessary modules and libraries
import { OpenAIEmbeddings } from '@langchain/openai'; // OpenAI embeddings utility
import { createRedisClient } from '@/lib/redis/client'; // Redis client creation utility

// Initialize OpenAI embeddings with API key and model
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY, // API key for OpenAI
  model: 'text-embedding-3-small', // Model to use for embeddings
});

// Function to generate embeddings for a given text using OpenAI
export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  return embeddings.embedQuery(text).then(embedding => {
    if (Array.isArray(embedding)) {
      return embedding; // Return the embedding array if valid
    } else {
      throw new Error('Unexpected embedding format from OpenAI');
    }
  }).catch(error => {
    console.error('Error generating OpenAI embedding:', error);
    throw error; // Throw error if embedding generation fails
  });
}

// Function to find similar records in Redis based on a query
export async function findSimilarities(query: string) {
  try {
    // Generate embedding for the query
    const embedding = await generateOpenAIEmbedding(query);

    // Convert the embedding to a buffer for Redis
    const queryBuffer = Buffer.from(new Float32Array(embedding).buffer);

    // Initialize Redis client
    const client = createRedisClient();
    await client.connect();

    // Search the Redis index for similar records
    const results = await client.ft.search(
      'idx:faq_vector',
      '*=>[KNN 3 @embedding $query_vec AS score]', {
      PARAMS: {
        'query_vec': queryBuffer // Pass the query embedding as a parameter
      },
      SORTBY: 'score', // Sort results by similarity score
      LIMIT: {
        from: 0, // Start from the first result
        size: 10, // Limit the number of results to 10
      },
      RETURN: ['question', 'answer', 'score'], // Return question, answer, and score fields
      DIALECT: 2, // Use dialect 2 for advanced query syntax
    });

    return results; // Return the search results
  } catch (error) {
    console.error('Error finding similar movies:', error);
    throw error; // Throw error if similarity search fails
  }
}