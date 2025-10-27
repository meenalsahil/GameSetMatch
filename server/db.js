import pg from "pg";
import { drizzle } from 'drizzle-orm/node-postgres';
const { Pool } = pg;
const poolInstance = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || "5432", 10),
    ssl: {
        rejectUnauthorized: false,
    },
});
export const query = async (text, params) => {
    try {
        const start = Date.now();
        const res = await poolInstance.query(text, params);
        const duration = Date.now() - start;
        console.log("executed query", { text, duration, rows: res.rowCount });
        return res;
    }
    catch (error) {
        console.error("Error executing query", text, error);
        throw error;
    }
};
export const pool = poolInstance;
export const db = drizzle(poolInstance);
