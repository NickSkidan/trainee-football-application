import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";

const getDatabaseCredentials = async () => {
  const secretName = "trainee/football/app/transfer/db/secret";

  const client = new SecretsManagerClient();

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

export const DBClient = async (): Promise<Client> => {
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
