FROM node:8.12.0-jessie

RUN npm i forever -g --silent

WORKDIR /app
COPY . /app

RUN npm i --production --silent

EXPOSE 8080

CMD [ "npm", "run", "start" ]
