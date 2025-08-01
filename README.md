# Redis-based FAQ System with RAG Pattern

This project is a highly efficient FAQ system built using Redis 8 as a vector database and the Retrieval-Augmented Generation (RAG) pattern. The application is developed with Next.js, providing a modern and scalable architecture for handling FAQ queries with contextual embeddings.

## Features

- **Vector Database**: Utilises Redis for storing and querying vector embeddings for efficient similarity searches.
- **RAG Pattern**: Combines retrieval-based methods with generative AI to provide accurate and context-aware answers.
- **OpenAI Integration**: Leverages OpenAI's embedding models for generating high-dimensional vector representations of questions.
- **Next.js Framework**: Built with Next.js for server-side rendering and API routes.
- **Scalable Architecture**: Designed to handle large datasets and high query volumes efficiently.
- **Caching**: Implements Redis caching to store frequently accessed results, reducing response times and improving performance.

## How It Works

1. **Ingestion**:
   - Questions and answers are ingested into the system.
   - Each question is converted into a vector embedding using OpenAI's embedding model.
   - The embeddings, along with the corresponding answers, are stored in Redis as JSON documents.

2. **Querying**:
   - When a user submits a question, the system generates an embedding for the query.
   - Redis performs a K-Nearest Neighbors (KNN) search to find the most similar questions based on their embeddings.
   - The RAG pattern is used to combine the retrieved context with a generative AI model to produce a final answer.
   - Frequently accessed results are cached in Redis to improve subsequent query performance.

## Installation

1. Clone the repository:
   ```bash
   $ git clone https://github.com/dilumdarshana/ai-faq-memory-assistant.git
   $ cd ai-faq-memory-assistant
   ```

2. Install dependencies:
   ```bash
   $ pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     REDIS_HOST=<your_redis_host>
     REDIS_PORT=<your_redis_port>
     REDIS_USERNAME=<your_redis_username>
     REDIS_PASSWORD=<your_redis_password>
     OPENAI_API_KEY=<your_openai_api_key>
     ```

4. Start the development server:
   ```bash
   $ pnpm dev
   ```

## API Endpoints

### 1. **Ingest FAQs**
   - **Endpoint**: `/api/ingest`
   - **Method**: `POST`
   - **Payload**:
     ```json
     [
       {
         "question": "What is Redis?",
         "answer": "Redis is an in-memory data structure store."
       }
     ]
     ```
   - **Description**: Ingests FAQs into the system by generating embeddings and storing them in Redis.

### 2. **Query FAQs**
   - **Endpoint**: `/api/ask`
   - **Method**: `POST`
   - **Payload**:
     ```json
     {
       "question": "What is Redis?"
     }
     ```
   - **Description**: Queries the system to find the most relevant answer based on the input question. Results are cached for faster subsequent queries.

## Folder Structure

```
lib/
  embeddings.ts       # Functions for generating embeddings and finding similarities
  redis/
    client.ts         # Redis client configuration
    resultIndex.ts    # Logic for creating the result index
    vectorIndex.ts    # Logic for creating the vector index
  utils.ts            # Utility functions (e.g., hashing)
app/
  api/
    ingest/           # API route for ingesting FAQs
    ask/              # API route for querying FAQs
    list/             # API route for listing FAQs
    create-index/     # API route for creating Redis indexes
```

## Technologies Used

- **Redis 8**: Used as a vector database for storing embeddings and performing similarity searches. Also used for caching frequently accessed results.
- **OpenAI**: Provides embedding models for generating vector representations of text.
- **Next.js**: Framework for building the application with server-side rendering and API routes.
- **TypeScript**: Ensures type safety and better developer experience.

## Future Enhancements

- Admin page to add question/answer
- Integrate additional vector search algorithms.

## License

This project is licensed under the MIT License.
