import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const DATABASE_URL = "postgresql://postgres:TCjGFSKBESZMulrecziXNGFGKLjXjXZT@yamanote.proxy.rlwy.net:38916/railway";

async function resetAdmin() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    
    const newHash = await bcrypt.hash("admin123", 10);
    
    await client.query(
      'UPDATE players SET password_hash = $1 WHERE email = $2',
      [newHash, 'sudhirmalin@gmail.com']
    );
    
    console.log('✅ Admin password reset!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

resetAdmin();