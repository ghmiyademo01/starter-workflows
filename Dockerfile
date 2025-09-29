FROM node:18-alpine
WORKDIR /app

# 必要なファイルだけコピー（package.json は依存関係のため）
COPY script/sync-ghes/package*.json ./
RUN npm install --nclude=dev

# dist フォルダと設定ファイルをコピー
COPY script/sync-ghes/dist ./dist
COPY script/sync-ghes/settings.json ./dist/settings.json

EXPOSE 3000

# tsc 実行権限を付与
RUN chmod +x node_modules/.bin/tsc

# index.js を起動（必要に応じて exec.js に変更可能）
CMD ["node", "dist/index.js"]
