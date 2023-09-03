<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Role-Based Access Control (RBAC)

This repository is a custom implementiion of Role-Based Access Control (RBAC) system using JSON Web Tokens ([JWT](https://jwt.io/)) and the [Nest.js](https://github.com/nestjs/nest) framework. In addition, covered the Continuous Integration/Continuous Deployment (CI/CD) process using GitHub, AWS CodeBuild and AWS Elastic Beanstalk. RBAC is a method of restricting access to system resources based on the roles assigned to individual users. This method is widely used because of its flexibility and ease of management.


### Prerequisites
Before running the RBAC app, make sure you have the following:
<ul>
    <li>Node.js (version 12 or higher)</li>
    <li>PostgreSQL</li>
</ul>

## Installation

### Local

```bash
# 1.Clone the repository
$ git clone <repository_url>

# 2.Install dependencies
$ npm install

# 3.Create environment files 
# (Create two files named .env.development and .env.test in the root directory of the project.)
# Fill env files

PORT=3000
JWT_SECRET=thisissecret
JWT_EXPIRATION_TIME='60m'
PG_HOST: [PG_HOST],
PG_PORT: [PG_PORT],
PG_USERNAME: [PG_USENAME],
PG_PASSWORD: [PG_PASSWORD],
PG_DATABASE: [PG_DATABASE],

# 4.Build app 
# (This will let generate migration files)
$ npm run build 

# 5.Generate and run migrations
# 5.1 To generate migrations, run the following command:

$ npm run typeorm:dev migration:generate ./migrations/initial-schema -- -o -d ./src/db.dataSource.ts

# 5.2 To create the necessary database tables, run the migration:
$ npm run typeorm:dev migration:run -- -d ./src/db.dataSource.ts
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## License

Nest is [MIT licensed](LICENSE).