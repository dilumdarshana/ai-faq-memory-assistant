import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@/lib/redis/client';

const client = createRedisClient();

export async function POST(req: NextRequest) {
  try {
    const { index } = await req.json();
    await client.connect();

    const records = await client.ft.search('idx:faq_vector', '*', {
      LIMIT: {
        from: 0,
        size: 10,
      },
      RETURN: ['question', 'answer']
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('List data error:', error);
    return NextResponse.json({ error: 'Failed to listing FAQs' }, { status: 500 });
  } finally {
    await client.quit();
  }
}
