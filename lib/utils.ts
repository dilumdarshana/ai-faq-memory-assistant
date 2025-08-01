// Import the crypto module for hashing
import crypto from 'crypto';

// Function to create a SHA-256 hash for a given input string
export function createHash(input: string): string {
  return crypto.createHash('sha256') // Create a SHA-256 hash instance
    .update(input) // Update the hash with the input string
    .digest('hex'); // Convert the hash to a hexadecimal string
}
