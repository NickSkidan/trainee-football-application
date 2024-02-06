import { DataSource } from "typeorm";
import { appDataSourceInstance } from "./data-source";

class DataSourceInitializer {
  private static instance: DataSourceInitializer;
  private dataSource: DataSource | null = null;

  private constructor() {}

  public static getInstance(): DataSourceInitializer {
    if (!DataSourceInitializer.instance) {
      DataSourceInitializer.instance = new DataSourceInitializer();
    }
    return DataSourceInitializer.instance;
  }

  public async initializeDataSource(): Promise<DataSource> {
    try {
      if (!this.dataSource) {
        const dataSource = await appDataSourceInstance;
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
          console.log(
            "Initializing new DataSource. PostgreSQL is connected..."
          );
        } else {
          console.log("PostgreSQL is already connected");
        }
        this.dataSource = dataSource;
      }

      return this.dataSource;
    } catch (error) {
      console.error("Error initializing DataSource:", error);
      throw error;
    }
  }
}

const dataSourceInitializer = DataSourceInitializer.getInstance();
export const initializedDataSource =
  dataSourceInitializer.initializeDataSource();
