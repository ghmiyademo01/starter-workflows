
FROM node:18-alpine
WORKDIR /app

# パッケージインストール
COPY script/sync-ghes/package*.json ./
RUN npm install

# ソースコードコピー
COPY script/sync-ghes/. .

# TypeScriptをJavaScriptにコンパイル
RUN npm run build

EXPOSE 3000
