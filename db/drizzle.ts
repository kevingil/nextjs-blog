import * as schema from './schema';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
