import { logger } from "../../../shared/utils/logger";
import { query } from '../../../shared/database/postgres.connector';
import { User, Content } from '../types';

/**
 * Searches the 'users' table for a username.
 */
export async function findUsers(searchText: string, limit: number, offset: number): Promise<User[]> {
  const sql = `
    SELECT
      user_id,
      username,
      first_name,
      last_name,
      profile_image
    FROM users
    WHERE
      username ILIKE $1 OR
      first_name ILIKE $1 OR
      last_name ILIKE $1
    ORDER BY first_name, last_name
    LIMIT $2 OFFSET $3;
  `;
  const params = [`%${searchText}%`, limit, offset];

  try {
    const result = await query(sql, params);
    return result.rows;
  } catch (err) {
    logger.error('Error executing user search query:', err);
    throw new Error('Database query for users failed.');
  }
}

/**
 * Searches the 'content' table.
 * It uses the 'summary' column for the preview and searches title and content body.
 */
export async function findContent(searchText: string, limit: number, offset: number): Promise<Content[]> {
  const sql = `
    SELECT
      c.content_id,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_image,
      c.title,
      COALESCE(c.summary, LEFT(c.content, 150)) as summary,
      c.date_created
    FROM content c
    JOIN users u ON c.creator_id = u.user_id
    WHERE c.title ILIKE $1 OR c.content ILIKE $1
    ORDER BY c.date_created DESC
    LIMIT $2 OFFSET $3;
  `;
  const params = [`%${searchText}%`, limit, offset];

  try {
    const result = await query(sql, params);
    return result.rows;
  } catch (err) {
    logger.error('Error executing content search query:', err);
    throw new Error('Database query for content failed.');
  }
}