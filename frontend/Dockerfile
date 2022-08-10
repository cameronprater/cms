FROM node:latest AS dev

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "run", "start"]

FROM nginx:latest AS prod

WORKDIR /var/www/html
COPY --from=dev /app/build .

CMD ["nginx", "-g", "daemon off;"]