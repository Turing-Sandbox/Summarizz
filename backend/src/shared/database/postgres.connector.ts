import { Pool } from 'pg';
import { env } from '../config/environment'; // Assuming you have db config here

// Use this to connect to the DB. The pool will maintain a pool of connections so that
// you don't have to keep creating new connections
const pool = new Pool({
  user: env.db.user,
  host: env.db.host,
  database: env.db.database,
  password: env.db.password,
  port: parseInt(env.db.port as string),
});

export function query(text: string, params?: any[]) : Promise<any> {
  return pool.query(text, params);
}

export default pool;