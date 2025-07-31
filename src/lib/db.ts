// src/db/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'example',
  database: 'postgres',
});

export default pool;
