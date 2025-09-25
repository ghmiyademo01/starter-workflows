# Node.js ベースイメージ
FROM node:18-alpine
WORKDIR /app

# パッケージをコピーしてインストール
COPY package*.json ./
RUN npm install --production

# アプリのソースをコピー
COPY . .

# ポートを公開
EXPOSE 3000

# アプリを起動
