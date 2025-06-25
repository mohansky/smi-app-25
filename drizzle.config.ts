// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//   out: './drizzle',
//   schema: './db/schema.ts',
//   dialect: 'postgresql',
//   dbCredentials: {
//     url: process.env.DATABASE_URL as string,
//   },
// });

// import { config } from 'dotenv';
// import { defineConfig } from "drizzle-kit";

// config({ path: '.env.local' });

// export default defineConfig({
//   schema: "./db/schema.ts",
//   out: "./migrations",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// });

// drizzle.config.ts
// import type { Config } from 'drizzle-kit';

// export default {
//   schema: './db/schema.ts',
//   out: './drizzle',
//   dialect: 'sqlite', // Use 'dialect' instead of 'driver'
//   dbCredentials: {
//     url: 'sqlite.db',
//   },
// } satisfies Config;

// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // Turso uses SQLite dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    token: process.env.DATABASE_AUTH_TOKEN, // Optional
  },
} satisfies Config;