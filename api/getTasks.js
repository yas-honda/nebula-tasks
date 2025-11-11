
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`SELECT * FROM tasks ORDER BY created_at DESC;`;
    return response.status(200).json({ tasks: rows });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Failed to fetch tasks from database', details: error.message });
  }
}
