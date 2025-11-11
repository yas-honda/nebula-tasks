import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'PUT') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id, text } = request.body;

    if (!id || typeof id !== 'number') {
      return response.status(400).json({ message: 'Task ID is required and must be a number.' });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return response.status(400).json({ message: 'Task text is required and cannot be empty.' });
    }

    const result = await sql`UPDATE tasks SET text = ${text.trim()} WHERE id = ${id};`;

    if (result.rowCount === 0) {
        return response.status(404).json({ message: 'Task not found.' });
    }
    
    return response.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Failed to update task in database', details: error.message });
  }
}
