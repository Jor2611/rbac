import { DataSource } from "typeorm";
import { dataSourceOptions } from "./dataSource.options";

const dataSource = new DataSource(dataSourceOptions);

dataSource
  .initialize()
  .then(() => {
    console.log('DataSource initialized  successfuly!');
  })
  .catch(err => {
    console.error('DataSource initialization error: ',err);
  });

export default dataSource;