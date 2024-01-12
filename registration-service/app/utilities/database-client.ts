import { Client } from "pg";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const getDatabaseCredentials = async () => {
  const secretName = process.env.DB_SECRET_NAME;
  const region = process.env.AWS_REGION;

  const client = new SecretsManagerClient({ region });

  let response;
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );
  } catch (error) {
    console.error(
      "Error retrieving database credentials from Secrets Manager:",
      error
    );
    throw error;
  }
  const secretString = response.SecretString || "";
    return JSON.parse(secretString);
};

export const DBClient = async () => {
  const { host, username, dbname, password, port } =
    await getDatabaseCredentials();

  return new Client({
    host,
    user: username,
    database: dbname,
    password,
    port: parseInt(port || "5432", 10),
  });
};
