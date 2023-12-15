import config from '.'

export =  {
  host: config.postgres.host,
  type: 'postgres',
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  entities: [
    'app/entities/*.entity.ts',
  ],
  migrations: [
    'app/migrations/*.ts',
  ],
  cli: {
    migrationsDir: 'app/migrations',
  },
  synchronize: false,
};