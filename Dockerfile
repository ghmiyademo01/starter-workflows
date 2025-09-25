
FROM node:18-alpine
WORKDIR /app
COPY script/sync-ghes/package*.json ./
RUN npm install --production
COPY script/sync-ghes/. .                         # ソース一式をコピー
EXPOSE 3000
CMD ["npm", "start"]
