import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = request.body;

    if (!id || typeof id !== 'number') {
      return response.status(400).json({ message: 'Task ID is required and must be a number.' });
    }

    const result = await sql`DELETE FROM tasks WHERE id = ${id};`;

    if (result.rowCount === 0) {
        return response.status(404).json({ message: 'Task not found.' });
    }
    
    return response.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Failed to delete task from database', details: error.message });
  }
}
