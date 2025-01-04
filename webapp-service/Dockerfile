FROM node:20-alpine

WORKDIR /webapp-service

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]