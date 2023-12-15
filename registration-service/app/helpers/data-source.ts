import config from "../config";
import { User } from "../entities/user.entity";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.postgres.host,
    port: parseInt(config.postgres.port),
    username: config.postgres.username,
    password: config.postgres.password,
    database: config.postgres.database,
    entities: [User],
    synchronize: true,
})

AppDataSource.initialize()
    .then(() => {
        console.log('Postgresql is connected...')
    })
    .catch((error) => console.log(error))