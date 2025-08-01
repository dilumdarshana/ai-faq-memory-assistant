import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createRedisClient } from '@/lib/redis/client';
import { findSimilarities } from '@/lib/embeddings';
import { createHash } from '@/lib/utils';

const client = createRedisClient();

type RedisResponse = {
  total: number;
  documents: {
    id: string;
    value: Record<string, unknown>;
  }[];
};

const chtModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  temperature: 0.7,
});

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    await client.connect();

    // Look for Redis cache first
    const hash = createHash(question);
    const cacheKey = `result:${hash}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      console.log('Cache hit for question');
      return NextResponse.json({ answer: cached });
    }

    // Search Redis vector index
    const redisResponse = await findSimilarities(question);

    const context = (redisResponse as RedisResponse)?.documents
      ?.map(doc => JSON.stringify(doc.value, null, 2))
      .join('\n') || '';

    // Create a prompt template for the chat model
    const prompt = PromptTemplate.fromTemplate(`
      You are a helpful FAQ assistant. Answer the user's questions based only on the following context.
      If the answer is not in the context, reply politely that you do not have that information.
      Do not mention that the answer came from the context.
      ===================
      Context: {context}
      ===================
      
      User: {question}
      
      Assistant:
    `);

    // Create a runnable sequence with the prompt and chat model
    const chain = RunnableSequence.from([
      {
        question: () => question,
        context: () => context,
      },
      prompt,
      chtModel, // LLM instance
      new StringOutputParser(),
    ]);

    // Generate response
    const output = await chain.invoke({});

    // Store the response in Redis cache
    await client.set(cacheKey, output, { EX: 3600 }); // Cache for 1 hour

    return NextResponse.json({ answer: output });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    await client.quit();
  }
}
