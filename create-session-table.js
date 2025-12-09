import pg from 'pg';
const { Client } = pg;

// Remove SSL requirement from connection string
const DATABASE_URL = "postgresql://postgres:TCjGFSKBESZMulrecziXNGFGKLjXjXZT@yamanote.proxy.rlwy.net:38916/railway";

async function createSessionTable() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);

  console.log('✅ Session table created!');
  await client.end();
}

createSessionTable();