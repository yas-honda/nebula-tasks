
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Vercel automatically parses the JSON body for POST requests
    const { text } = request.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return response.status(400).json({ message: 'Task text is required and cannot be empty.' });
    }

    await sql`INSERT INTO tasks (text) VALUES (${text.trim()});`;
    
    return response.status(201).json({ message: 'Task added successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Failed to add task to database', details: error.message });
  }
}
