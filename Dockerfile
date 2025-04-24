FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
# Expose port
EXPOSE 8080

CMD ["npm", "start"]