# FROM nginx AS build
FROM node:alpine AS build

# Install essential tools
RUN apk update && \
    apk add --no-cache git

COPY ./ /tmp/dapp

WORKDIR /tmp/dapp
RUN npm install
RUN yarn build

FROM nginx

COPY --from=build /tmp/dapp/dist /usr/www
COPY operations/nginx.conf /etc/nginx/nginx.conf
