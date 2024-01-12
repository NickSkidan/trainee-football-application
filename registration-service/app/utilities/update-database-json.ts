import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const getDatabaseCredentials = async () => {
  const secretName = process.env.DB_SECRET_NAME;
  const region = process.env.AWS_REGION;
  console.log("Secret Name:", secretName);
  console.log("Region:", region);

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

const updateDatabaseJson = async () => {
  const credentials = await getDatabaseCredentials();
  const databaseJsonPath = path.join(__dirname, "../../database.json");

  const databaseJsonContent = {
    dev: {
      driver: "pg",
      user: credentials.username,
      password: credentials.password,
      host: credentials.host,
      database: credentials.dbname,
    },
  };

  fs.writeFileSync(
    databaseJsonPath,
    JSON.stringify(databaseJsonContent, null, 2)
  );
  console.log("database.json updated successfully.");
};

updateDatabaseJson();
