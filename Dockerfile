FROM node:12.11.1 as dist
WORKDIR /tmp/
COPY . .
RUN npm install
RUN npm run build

FROM node:12.11.1-alpine as node_modules
WORKDIR /tmp/
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

FROM node:12.11.1-alpine
EXPOSE 8000
HEALTHCHECK --start-period=10s --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
RUN addgroup -S app \
    && adduser -S -g app app \
    && mkdir -p /usr/src/app \
    && apk -U add git python make g++ curl && rm -rf /var/cache/apk/*
WORKDIR /usr/src/app
COPY --from=node_modules /tmp/node_modules ./node_modules
COPY --from=dist /tmp/dist ./dist
CMD ["node", "dist/src/main.js"]
