import { join } from "path";
import { DataSourceOptions } from "typeorm";

let dsOptions: DataSourceOptions;

switch(process.env.NODE_ENV){
  case "development":
    dsOptions = {
      type: 'sqlite',
      database: 'db.sqlite',
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.js')],
      synchronize: true
    };
    break;
  case "test":
    dsOptions = {
      type: 'sqlite',
      database: 'test.sqlite',
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
      migrationsRun: true,
      synchronize: false,
    };
    break;
  default:
    throw new Error('Unknown environment!');
}

export const dataSourceOptions = dsOptions;