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
      profile_image
    FROM users
    WHERE
      username ILIKE $1
    ORDER BY username
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
      content_id,
      creator_id,
      title,
      COALESCE(summary, LEFT(content, 150)) as summary,
      date_created
    FROM content
    WHERE title ILIKE $1 OR content ILIKE $1
    ORDER BY date_created DESC
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