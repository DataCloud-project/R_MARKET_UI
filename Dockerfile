# stage1 as builder
FROM node:16 as builder

# copy the package.json to install dependencies
COPY package*.json ./

# Create a directory for the SDK
RUN mkdir /R-MARKET_SDK

# Copy your local SDK directory into the image
COPY R-MARKET_SDK ./R-MARKET_SDK

# Install the dependencies and make the folder
RUN npm install && mkdir /react-ui && mv ./node_modules ./react-ui

WORKDIR /react-ui

COPY . .

# Build the project and copy the files
RUN npm run build


FROM nginx:alpine

#!/bin/sh

COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./fullchain.pem /etc/ssl/fullchain.pem
COPY privkey.pem /etc/ssl/privkey.pem

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=builder /react-ui/build /usr/share/nginx/html

EXPOSE 5555

ENTRYPOINT ["nginx", "-g", "daemon off;"]