FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false && npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]