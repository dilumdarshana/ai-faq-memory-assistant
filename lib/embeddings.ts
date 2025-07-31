import { OpenAIEmbeddings } from '@langchain/openai';
import { createRedisClient } from '@/lib/redis/client';

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-small',
});

export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  return embeddings.embedQuery(text).then(embedding => {
    if (Array.isArray(embedding)) {
      return embedding;
    } else {
      throw new Error('Unexpected embedding format from OpenAI');
    }
  }).catch(error => {
    console.error('Error generating OpenAI embedding:', error);
    throw error;
  });
}

export async function findSimilarities(query: string) {
  try {
    const embedding = await generateOpenAIEmbedding(query);
    const queryBuffer = Buffer.from(new Float32Array(embedding).buffer);

    const client = createRedisClient();
    await client.connect();

    const results = await client.ft.search(
      'idx:faq_vector',
      '*=>[KNN 10 @embedding $query_vec AS score]', {
      PARAMS: {
        'query_vec': queryBuffer
      },
      SORTBY: 'score',
      LIMIT: {
        from: 0,
        size: 10,
      },
      RETURN: ['question', 'answer'],
      DIALECT: 2,
    });

    return results;
  } catch (error) {
    console.error('Error finding similar movies:', error);
    throw error;
  }
}