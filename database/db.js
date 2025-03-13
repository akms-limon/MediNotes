import { config } from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Load environment variables
config();

const connectionString = process.env.POSTGRESQL_URL;

if (!connectionString) {
    console.error('POSTGRESQL_URL is not set in the environment variables.');
    process.exit(1);
}

// Create a PostgreSQL pool with SSL enabled
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates
    },
});

const connectToPostgres = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL');
        client.release(); // Release the client back to the pool
        return pool;
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
        throw err;
    }
};

export { pool };
export default connectToPostgres;
