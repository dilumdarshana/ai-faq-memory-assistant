import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@/lib/redis/client';
import { generateOpenAIEmbedding } from '@/lib/embeddings';
import { createHash } from '@/lib/utils';

const client = createRedisClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
    }
    await client.connect();

    try {
      await Promise.all(
        body.map(async (item) => {
          const { question, answer } = item;

          if (!question || !answer) {
            throw new Error('Question and answer are required');
          }

          const embeddingArray = await generateOpenAIEmbedding(question);

          const hash = createHash(question);

          const key = `vector:${hash}`;

          const document = {
            question,
            answer,
            embedding: embeddingArray,
          };

          // Store as JSON document
          await client.json.set(key, '$', document);
        })
      );
    } catch (error) {
      console.error('Error storing embeddings:', error);
    }

    return NextResponse.json({ message: 'FAQs ingested successfully---' });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    await client.quit();
  }
}
