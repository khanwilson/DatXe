# NestJS Prisma

Template gọn cho NestJS + Prisma + PostgreSQL + Swagger + JWT Auth.

## Stack

- NestJS
- Prisma
- PostgreSQL
- Swagger
- Passport JWT
- bcrypt
- Docker / Docker Compose

## Auth Model

```prisma
model User {
  id            String   @id @default(uuid())
  user_name     String   @unique
  password_hash String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

## Chạy local

```bash
cp .env.example .env
bun install
docker compose up -d postgres
bun run prisma:generate
bun run prisma:migrate
bun run start:dev
```

API chạy ở:

- App: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`

## Chạy bằng Docker Compose

```bash
cp .env.example .env
docker compose up -d postgres
bun install
bun run prisma:migrate
docker compose up --build api
```

## Endpoints

### Register

`POST /api/auth/register`

```json
{
  "user_name": "admin",
  "password": "password123"
}
```

### Login

`POST /api/auth/login`

```json
{
  "user_name": "admin",
  "password": "password123"
}
```

Response có `access_token`.

### Profile

`GET /api/auth/profile`

Header:

```http
Authorization: Bearer <access_token>
```
