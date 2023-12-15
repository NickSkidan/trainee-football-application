export default {
    port: process.env.PORT,
    sessionSecret: process.env.SESSION_SECRET || 'default-secret',

    postgres: {
      port: process.env.POSTGRES_PORT || "5432",
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
    },
  };