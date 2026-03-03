FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsup.config.ts ./
COPY src/ ./src/
RUN --mount=type=cache,target=/root/.npm npm ci
RUN npm run build

FROM node:22-alpine AS release
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
ENV NODE_ENV=production
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --omit-dev
LABEL io.modelcontextprotocol.server.name="io.github.vessel-api/vesselapi-mcp"
ENTRYPOINT ["node", "dist/index.js"]
