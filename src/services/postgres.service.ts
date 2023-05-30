import { PoolClient } from 'pg';

export interface IPostgresService {
  query: (query: string, params: any[]) => Promise<any>;
}

export class PostgresService implements IPostgresService {
  dbPool: PoolClient;
  constructor(dbPool: PoolClient) {
    this.dbPool = dbPool;
  }

  async query(query: string, params: any[]) {
    try {
      const { rows } = await this.dbPool.query(query, params);

      return rows[0];
    } catch (err) {
      throw err;
    }
  }
}

export default PostgresService;
