import { DataSource } from "typeorm";
import { appDataSourceInstance } from "./data-source";

export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    const dataSource = await appDataSourceInstance;
    if (!dataSource.isInitialized) {
      await dataSource
        .initialize()
        .then(() => {
          console.log(
            "Initializing new DataSource. PostgreSQL is connected..."
          );
        })
        .catch((error) =>
          console.error("Error initializing DataSource:", error)
        );
    } else {
      console.log("PostgreSQL is already connected");
    }

    return dataSource;
  } catch (error) {
    console.error("Error initializing DataSource:", error);
    throw error;
  }
};

export const initializedDataSource = initializeDataSource();
