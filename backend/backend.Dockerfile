# syntax=docker/dockerfile:1



# Deps stage: install production dependencies only.
FROM dhi.io/node:24-alpine3.23-dev AS deps

WORKDIR /mini-task-manager/backend

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --omit=dev



# Runner stage: minimal runtime image with compiled app and production deps.
FROM dhi.io/node:24-alpine3.23-dev AS runner

ENV PATH=/mini-task-manager/backend/node_modules/.bin:$PATH

WORKDIR /mini-task-manager/backend

COPY --from=deps --chown=node:node /mini-task-manager/backend/node_modules ./node_modules
COPY --chown=node:node . .


RUN ["chmod", "+x", "entrypoint.sh"]

ENTRYPOINT ["./entrypoint.sh"]

USER node

EXPOSE 3000

CMD ["node", "server.js"]