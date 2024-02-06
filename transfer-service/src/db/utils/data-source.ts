import { DataSource } from "typeorm";
import { getDatabaseCredentials } from "./database-config";
import { Transfer } from "../entity/transfer";
import { InitDatabase1706623403281 } from "../migrations/1706623403281-InitDatabase";

const getAppDataSource = async (): Promise<DataSource> => {
  const credentials = await getDatabaseCredentials();

  const appDataSource = new DataSource({
    type: "postgres",
    host: credentials.host,
    port: credentials.port,
    username: credentials.username,
    password: credentials.password,
    database: credentials.dbname,
    entities: [Transfer],
    //migrations: ["./src/db/migrations/*.ts"],
    migrations: [InitDatabase1706623403281],
    synchronize: true,
  });

  return appDataSource;
};

export const appDataSourceInstance = getAppDataSource();
