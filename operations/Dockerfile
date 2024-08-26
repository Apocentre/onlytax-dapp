# FROM nginx AS build
FROM node:20 AS build

COPY ./ /tmp/dapp

WORKDIR /tmp/dapp
RUN npm install
RUN npm run build

FROM nginx

COPY --from=build /tmp/dapp/dist /usr/www
COPY operations/nginx.conf /etc/nginx/nginx.conf
