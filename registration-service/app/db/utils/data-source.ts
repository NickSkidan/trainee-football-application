import { DataSource } from "typeorm";
import { getDatabaseCredentials } from "./database-config";
import { Player } from "../entities/player";
import { User } from "../entities/user";
import { Team } from "../entities/team";

const getAppDataSource = async (): Promise<DataSource> => {
  const credentials = await getDatabaseCredentials();

  const appDataSource = new DataSource({
    type: "postgres",
    host: credentials.host,
    port: credentials.port,
    username: credentials.username,
    password: credentials.password,
    database: credentials.dbname,
    entities: [Player, Team, User],
    migrations: ["../db/migrations/*.ts"],
    synchronize: true,
  });

  return appDataSource;
};

export const appDataSourceInstance = getAppDataSource();
