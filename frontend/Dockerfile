FROM node:20-alpine AS base

WORKDIR /app

# Instala as dependências
FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# Compila a aplicação Next.js
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Imagem final de produção
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Cria grupo e usuário sem privilégios de root
RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nextjs

# Copia os arquivos necessários para execução
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
