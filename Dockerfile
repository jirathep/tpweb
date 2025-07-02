# Stage 1: Install dependencies
FROM node:20-alpine AS deps
# This is for Next.js which may need some native dependencies.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Use --frozen-lockfile for deterministic installs
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

EXPOSE 9002

ENV PORT 9002

# The standalone output creates a server.js file
# CMD ["node", "server.js"]
CMD ["npm", "run", "dev"]
