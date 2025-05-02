# Build Stage
FROM node:23-alpine 

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run","start:dev" ]
#run vs cmd: run komutundaki docker image proje halindeyken çalışır. cmd ise image çalışıyorken çalışır.