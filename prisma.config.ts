import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const isTest = process.env.NODE_ENV === 'test';

export default defineConfig({
  schema: isTest ? 'prisma_test/schema.test.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
