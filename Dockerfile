FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm run typeorm migration:generate ./migrations/initial-schema -- -o -d ./src/db.dataSource.ts

RUN npm run typeorm migration:run -- -d ./src/db.dataSource.ts

EXPOSE 3000

CMD ["npm","run","start"]