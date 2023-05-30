import { Pool } from 'pg';

const pool = new Pool({
  host: 'postgres',
  user: 'postgres',
  password: 'mysecretpassword',
  database: 'mydatabase',
  port: 5432,
});

export default pool;
