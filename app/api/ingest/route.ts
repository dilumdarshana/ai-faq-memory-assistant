// Import necessary modules and libraries
import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@/lib/redis/client'; // Redis client creation utility
import { generateOpenAIEmbedding } from '@/lib/embeddings'; // Function to generate embeddings using OpenAI
import { createHash } from '@/lib/utils'; // Utility to create a unique hash

// Initialize Redis client
const client = createRedisClient();

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Validate that the payload is an array
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
    }

    // Connect to the Redis client
    await client.connect();

    try {
      // Process each item in the array concurrently
      await Promise.all(
        body.map(async (item) => {
          const { question, answer } = item; // Destructure question and answer from the item

          // Validate that both question and answer are provided
          if (!question || !answer) {
            throw new Error('Question and answer are required');
          }

          // Generate an embedding for the question
          const embeddingArray = await generateOpenAIEmbedding(question);

          // Generate a unique hash for the question to use as a key in Redis
          const hash = createHash(question);

          // Define the Redis key for storing the document
          const key = `vector:${hash}`;

          // Create the document to store in Redis
          const document = {
            question, // Original question
            answer, // Corresponding answer
            embedding: embeddingArray, // Embedding vector for the question
          };

          // Store the document as a JSON object in Redis
          await client.json.set(key, '$', document);
        })
      );
    } catch (error) {
      // Log any errors that occur during the storage process
      console.error('Error storing embeddings:', error);
    }

    // Return a success response
    return NextResponse.json({ message: 'FAQs ingested successfully---' });
  } catch (error) {
    // Handle errors and return a 500 status
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    // Ensure the Redis client is disconnected
    await client.quit();
  }
}
