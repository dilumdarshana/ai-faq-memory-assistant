import { NextResponse } from 'next/server';
import { createVectorIndex } from '@/lib/redis/vectorIndex';
import { createResultIndex } from '@/lib/redis/resultIndex';

export async function POST() {
  try {
    const vector = await createVectorIndex();
    const result = await createResultIndex();

    return NextResponse.json({ vector, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Index creation failed.' }, { status: 500 });
  }
}
