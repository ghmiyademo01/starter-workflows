FROM node:18-alpine
#WORKDIR /app

COPY script/sync-ghes/package*.json ./
RUN npm install --include=dev

# アプリコードと設定ファイルをコピー
COPY script/sync-ghes/. .
COPY tsconfig.json ./tsconfig.json

# 必要なフォルダを追加コピー
COPY ci ./ci
COPY automation ./automation
COPY code-scanning ./code-scanning
COPY pages ./pages

RUN chmod +x node_modules/.bin/tsc
RUN npm run build

CMD ["node", "dist/index.js"]
