// Import necessary modules and libraries
import { NextResponse } from 'next/server';
import { createVectorIndex } from '@/lib/redis/vectorIndex'; // Function to create a vector index in Redis
import { createResultIndex } from '@/lib/redis/resultIndex'; // Function to create a result index in Redis

// Define the POST handler for the API route
export async function POST() {
  try {
    // Create a vector index in Redis
    const vector = await createVectorIndex();

    // Create a result index in Redis
    const result = await createResultIndex();

    // Return the results of the index creation
    return NextResponse.json({ vector, result });
  } catch (err) {
    // Handle errors and return a 500 status
    console.error(err);
    return NextResponse.json({ error: 'Index creation failed.' }, { status: 500 });
  }
}
