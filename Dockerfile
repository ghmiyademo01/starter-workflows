FROM node:18-alpine
WORKDIR /app
COPY server.js .        # これだけコピーすればOK
EXPOSE 3000
CMD ["node", "server.js"]
