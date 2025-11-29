import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:TCjGFSKBESZMulrecziXNGFGKLjXjXZT@yamanote.proxy.rlwy.net:38916/railway"
});

await client.connect();

const hash = await bcrypt.hash("admin123", 10);

await client.query(
  'UPDATE players SET password_hash = $1 WHERE email = $2',
  [hash, 'sudhirmalini@gmail.com']
);

console.log('✅ Admin password fixed!');
await client.end();