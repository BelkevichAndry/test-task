import { createClient } from '@clickhouse/client';

const clickhouseClient = createClient({
  host: 'http://clickhouse:8123',
});

export default clickhouseClient;
