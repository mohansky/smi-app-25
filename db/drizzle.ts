// import * as schema from "./schema";
// import { config } from "dotenv";
// import { drizzle } from "drizzle-orm/neon-http";

// config({ path: ".env" });

// export const db = drizzle(process.env.DATABASE_URL!, { schema }); // pass schema


// // db/drizzle.ts
// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import Database from 'better-sqlite3';
// import * as schema from './schema';

// // Create SQLite database file
// const sqlite = new Database('sqlite.db'); // This creates sqlite.db in your project root

// // Enable foreign keys (important for SQLite)
// sqlite.pragma('foreign_keys = ON');

// export const db = drizzle(sqlite, { schema });


// db/drizzle.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create Turso client
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN, // Optional, only if you have auth token
});

export const db = drizzle(client, { schema });