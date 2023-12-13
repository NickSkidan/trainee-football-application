export default {
    port: process.env.PORT,

    postgres: {
      port: process.env.POSTGRES_CONTAINER_PORT || "5432",
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
    },
  };