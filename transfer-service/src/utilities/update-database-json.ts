import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import path = require("path");
import fs = require("fs");

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
