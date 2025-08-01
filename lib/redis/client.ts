// Import the Redis client library
import { createClient } from 'redis';

// Function to create and configure a Redis client
export const createRedisClient = () => {
  const client = createClient({
    username: process.env.REDIS_USERNAME || 'default', // Redis username (default: 'default')
    password: process.env.REDIS_PASSWORD, // Redis password from environment variables
    socket: {
      host: process.env.REDIS_HOST, // Redis host from environment variables
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, // Redis port (default: 6379)
    },
  });

  // Handle Redis client errors
  client.on('error', (err) => {
    console.error('Redis Client Error', err); // Log any errors
  });

  return client; // Return the configured Redis client
};
