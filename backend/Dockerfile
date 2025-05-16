FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install -g nodemon && npm install
COPY . .

CMD ["nodemon", "src/index.js"]
