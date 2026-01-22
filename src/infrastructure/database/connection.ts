import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@config/env';
import * as schema from './schema';

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getDatabase = () => {
  if (!db) {
    if (!env.database.url) {
      throw new Error('DATABASE_URL is not configured');
    }

    client = postgres(env.database.url);
    db = drizzle(client, { schema });
  }

  return db;
};

export const closeDatabase = async () => {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
};
