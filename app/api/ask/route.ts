import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@/lib/redis/client';
import { findSimilarities, generateOpenAIEmbedding } from '@/lib/embeddings';

const client = createRedisClient();

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    await client.connect();

    // Step 2: Search Redis vector index
    const result = await findSimilarities(question)

    console.log('result', result)
    return NextResponse.json({ message: 'FAQs ingested successfully' });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    await client.quit();
  }
}
