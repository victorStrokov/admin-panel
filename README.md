This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

🚀 Запуск проекта

# Установка зависимостей

npm install

# Запуск в режиме разработки (с Turbopack)

npm run dev

# Сборка для продакшена

npm run build

# Запуск собранного проекта

npm run start

# Линтинг кода

npm run lint

🗄️ Работа с Prisma

# Генерация Prisma Client (после изменения schema.prisma)

npm run prisma:generate

# Создание и применение миграции

npm run prisma:migrate

# Просмотр базы через Prisma Studio

npm run pr

⚙️ Настройка окружения (.env)

# Database

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Node.js окружение

NODE_ENV=development

# JWT

JWT_SECRET=your-jwt-secret-key

# Next.js API

NEXT_PUBLIC_API_URL=/api

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
