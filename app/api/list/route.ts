// Import necessary modules and libraries
import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@/lib/redis/client'; // Redis client creation utility

// Initialize Redis client
const client = createRedisClient();

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    // Parse the request body to extract the index name
    const { index } = await req.json();

    // Connect to the Redis client
    await client.connect();

    // Search the Redis index for records
    const records = await client.ft.search(index, '*', {
      LIMIT: {
        from: 0, // Start from the first record
        size: 10, // Limit the number of records to 10
      },
      RETURN: ['question', 'answer'] // Return only the question and answer fields
    });

    // Return the retrieved records as a JSON response
    return NextResponse.json({ records });
  } catch (error) {
    // Handle errors and return a 500 status
    console.error('List data error:', error);
    return NextResponse.json({ error: 'Failed to listing FAQs' }, { status: 500 });
  } finally {
    // Ensure the Redis client is disconnected
    await client.quit();
  }
}
