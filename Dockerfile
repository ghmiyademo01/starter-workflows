FROM node:18-alpine
WORKDIR /app

COPY script/sync-ghes/package*.json ./
RUN npm install --include=dev

COPY script/sync-ghes/. .
COPY tsconfig.json ./tsconfig.json

RUN chmod +x node_modules/.bin/tsc
RUN npm run build

CMD ["node", "dist/index.js"]
