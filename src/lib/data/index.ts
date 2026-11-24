import { MemoryDataSource } from "./memory";
import type { DataSource } from "./types";

let instance: DataSource | undefined;

/**
 * Returns the process-wide data source. Today this is always the seeded
 * in-memory source. When DATABASE_URL is set, a PostgreSQL implementation
 * will be selected here (tracked in README "Roadmap").
 */
export function getDataSource(): DataSource {
  if (!instance) {
    instance = new MemoryDataSource();
  }
  return instance;
}

export type { DataSource, ProductPrices } from "./types";
