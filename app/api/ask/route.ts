// Import necessary modules and libraries
import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createRedisClient } from '@/lib/redis/client';
import { findSimilarities } from '@/lib/embeddings';
import { createHash } from '@/lib/utils';
interface CachedAnswer {
  question: string;
  answer: string;
  source: 'web' | 'db' | 'faq' | string;
  score: number;
  createdAt: string; // or Date if you convert it
}

// Initialize Redis client
const client = createRedisClient();

// Define the structure of the Redis response
// This includes the total number of documents and their details
// Each document has an ID and a value (key-value pairs)
type RedisResponse = {
  total: number;
  documents: {
    id: string;
    value: Record<string, unknown>;
  }[];
};

// Initialize the ChatOpenAI model with specific configurations
const chtModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY, // API key for OpenAI
  model: 'gpt-4o', // Model to use
  temperature: 0.7, // Controls randomness in responses
});

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    // Parse the question from the request body
    const { question } = await req.json();

    // Validate that a question is provided
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Connect to Redis client
    await client.connect();

    // Generate a unique hash for the question to use as a cache key
    const hash = createHash(question.toLowerCase());
    const cacheKey = `result:${hash}`;

    // Check if the response is already cached in Redis
    // const cached = await client.get(cacheKey);
    const cached = await client.json.get(cacheKey, { path: '$' }) as unknown as CachedAnswer;

    if (cached) {
      console.log('Cache hit for question');
      return NextResponse.json({ answer: cached.answer });
    }

    // If not cached, search for similar documents in Redis vector index
    const redisResponse = await findSimilarities(question);

    // Extract context from the Redis response
    const context = (redisResponse as RedisResponse)?.documents
      ?.map(doc => JSON.stringify(doc.value, null, 2)) // Format each document as a JSON string
      .join('\n') || ''; // Join all documents with a newline

    // Create a prompt template for the chat model
    const prompt = PromptTemplate.fromTemplate(`
      You are a friendly and helpful FAQ assistant. Answer the user's question using the context below. 
      Feel free to paraphrase and make the answer conversational, but do not include information not in the context.
      ===================
      Context: {context}
      ===================
      
      User: {question}
      
      Assistant:
    `);

    // Create a sequence of operations to process the question
    const chain = RunnableSequence.from([
      {
        question: () => question, // Provide the question
        context: () => context, // Provide the context
      },
      prompt, // Use the prompt template
      chtModel, // Use the ChatOpenAI model
      new StringOutputParser(), // Parse the output as a string
    ]);

    // Generate the response using the chain
    const output = await chain.invoke({});

    // Cache the response in Redis for future use (expires in 15 minutes)
    await client.json.set(cacheKey, '$', {
      question,
      answer: output,
      source: 'web',
      score: 1,
      createdAt: Math.floor(Date.now() / 1000), // Store current timestamp as createdAt
    });
    await client.expire(cacheKey, 60 * 15);  // 15 minutes TTL
    // await client.set(cacheKey, output, { EX: 60 * 15 });

    // Return the generated response
    return NextResponse.json({ answer: output });
  } catch (error) {
    // Handle errors and return a 500 status
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest FAQs' }, { status: 500 });
  } finally {
    // Ensure the Redis client is disconnected
    await client.quit();
  }
}
