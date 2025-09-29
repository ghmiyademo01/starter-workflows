FROM node:18-alpine

# 必要なツールを先にインストール
RUN apk add --no-cache git

# 必要なフォルダをルートにコピー
WORKDIR /
COPY ci ./ci
COPY automation ./automation
COPY code-scanning ./code-scanning
COPY pages ./pages

# アプリを /app に配置
WORKDIR /app
COPY script/sync-ghes/package*.json ./
RUN npm install --include=dev

COPY script/sync-ghes/. .
COPY tsconfig.json ./tsconfig.json

RUN chmod +x node_modules/.bin/tsc
RUN npm run build

CMD ["node", "dist/index.js"]
