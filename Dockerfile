FROM node:18-alpine
WORKDIR /app

# パッケージインストール
COPY script/sync-ghes/package*.json ./
RUN npm install

# ソースコードと tsconfig をコピー
COPY script/sync-ghes/. .

# tsconfig.json を正しい位置にコピー（必要なら）
COPY tsconfig.json ./tsconfig.json

# TypeScript をコンパイル
RUN npm run build

# settings.json を dist にコピー
COPY script/sync-ghes/settings.json ./dist/settings.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
