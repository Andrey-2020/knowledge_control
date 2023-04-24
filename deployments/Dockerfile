# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . ./

# Prepare configuretion
# CMD rm ./src/plugins/http/http_config.js
# COPY deployments/http_config.js ./src/plugins/http

# start app
ENTRYPOINT ["npm", "start"]

