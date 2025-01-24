FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
#RUN npm ci --only=production

COPY . .

EXPOSE 5698
CMD [ "node", "./bin/www" ]
