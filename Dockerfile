FROM node:18-alpine
WORKDIR /

# 必要なフォルダをルートにコピー
COPY ci ./ci
COPY automation ./automation
COPY code-scanning ./code-scanning
COPY pages ./pages

WORKDIR /app
COPY script/sync-ghes/package*.json ./
RUN npm install --include=dev

COPY script/sync-ghes/. .
COPY tsconfig.json ./tsconfig.json

# gitを追加
RUN apk add --no-cache git

RUN chmod +x node_modules/.bin/tsc
RUN npm run build

CMD ["node", "dist/index.js"]
