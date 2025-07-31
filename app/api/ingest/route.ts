import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createRedisClient } from '@/lib/redis/client';
import { generateOpenAIEmbedding } from '@/lib/embeddings';

const client = createRedisClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
    }
    await client.connect();

    await Promise.all(
      body.map(async (item) => {
        const { question, answer } = item;

        if (!question || !answer) {
          throw new Error('Question and answer are required');
        }

        const embeddingArray = await generateOpenAIEmbedding(question);

        const hash = crypto.createHash('sha256').update(question).digest('hex');
        const key = `vactor:${hash}`;

        const document = {
          question,
          answer,
          embedding: embeddingArray,
        };

        // Store as JSON document
        await client.json.set(key, '$', document);
      })
    );

    return NextResponse.json({ message: 'FAQs ingested successfully---' });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    await client.quit();
  }
}
