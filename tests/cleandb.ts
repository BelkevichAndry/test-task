import clickhouseClient from '../src/db/clickhouse/connection';

export default async () => {
  clickhouseClient.query({ query: 'TRUNCATE TABLE tracking_events' });
};
