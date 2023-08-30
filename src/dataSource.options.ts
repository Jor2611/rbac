import { readFileSync } from "fs";
import { join } from "path";
import { DataSourceOptions } from "typeorm";

let dsOptions: DataSourceOptions;

switch(process.env.NODE_ENV){
  case "development":
    dsOptions = {
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.js')],
      synchronize: true
    };
    break;
  case "test":
    dsOptions = {
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.ts')],
      migrationsRun: true,
      synchronize: false,
    };
    break;
  case "production":  
    dsOptions = {
      type: 'postgres',
      host: process.env.RDS_HOSTNAME,
      port: +process.env.RDS_PORT,
      username: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB_NAME,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.js')],
      migrationsRun: false,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
        ca: readFileSync(join(__dirname, '..','./ca/global-bundle.pem'))
      }
    };
    break;
  default:
    throw new Error('Unknown environment!');
}

export const dataSourceOptions = dsOptions;