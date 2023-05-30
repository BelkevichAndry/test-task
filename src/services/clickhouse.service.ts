import {
  createClient,
  ClickHouseClient,
  QueryParams,
} from '@clickhouse/client';

export interface IClickhouseService {
  query: (query: QueryParams) => Promise<any>;
}

export class ClickhouseService implements IClickhouseService {
  client: ClickHouseClient;
  constructor(client: ClickHouseClient) {
    this.client = client;
  }

  async query(query: QueryParams) {
    const resultSet = await this.client.query(query);
    const dataset = await resultSet.json();
    return dataset;
  }
}

export default ClickhouseService;
