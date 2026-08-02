# docker build . -t utthan:latest
FROM --platform=linux/amd64 node:21.4.0-bullseye-slim

WORKDIR /app

RUN apt update

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm start
