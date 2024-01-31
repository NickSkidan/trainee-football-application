import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import dotenv from "dotenv";
dotenv.config();

export const getDatabaseCredentials = async () => {
  const secretName = process.env.DB_SECRET_NAME;

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
