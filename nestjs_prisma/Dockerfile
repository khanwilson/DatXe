FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run prisma:generate
RUN bun run build

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 3000
CMD ["bun", "run", "start:prod"]
