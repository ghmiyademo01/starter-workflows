FROM node:18-alpine
#WORKDIR /app

# パッケージインストール
COPY script/sync-ghes/package*.json ./
RUN npm install

# ソースコードコピー
COPY script/sync-ghes/. .

# TypeScript を JavaScript にコンパイル
RUN npm run build
COPY script/sync-ghes/settings.json ./dist/settings.json

EXPOSE 3000

# 起動コマンド
CMD ["node", "dist/index.js"]
