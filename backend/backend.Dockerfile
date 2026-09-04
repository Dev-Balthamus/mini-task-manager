# syntax=docker/dockerfile:1



# Deps stage: install production dependencies only.
FROM node:24-alpine AS deps

WORKDIR /mini-task-manager/backend

# 1. Copia i file delle dipendenze e installa tutto (dev + prod per far girare tsc)
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 2. Copia l'intero codice sorgente
COPY . .

# 3. Compila TypeScript generando dist/
RUN npm run build

# 4. Installa dos2unix, converte i line endings e assicura i permessi per l'entrypoint
RUN apk add --no-cache dos2unix && \
    dos2unix entrypoint.sh && \
    chmod +x entrypoint.sh

ENV PATH=/mini-task-manager/backend/node_modules/.bin:$PATH

EXPOSE 3000

USER node

ENTRYPOINT ["./entrypoint.sh"]

# 5. Avvia il server compilato in JS
CMD ["node", "dist/server.js"]