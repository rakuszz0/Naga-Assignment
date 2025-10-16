import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_app',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

const pool = mysql.createPool(dbConfig);

export const testConnection = async (): Promise<void> => {
    try {
        const connection = await pool.getConnection();
        console.log('Mysql connected successfully.');
        connection.release();
    } catch (error) {
        console.error('Error connecting to Mysql:', error);
        process.exit(1);
    }
}

export {pool};