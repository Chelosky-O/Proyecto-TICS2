FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
# backend/Dockerfile  (solo añade nodemailer)
RUN npm install -g nodemon && \
    npm install                \
      nodemailer               \
      nodemailer-ses-transport \
      @sendgrid/mail
COPY . .

CMD ["nodemon", "src/index.js"]
