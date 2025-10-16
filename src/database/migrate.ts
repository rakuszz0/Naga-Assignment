import { pool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async (): Promise<void> => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      );
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_done BOOLEAN DEFAULT FALSE,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const [indexes]: any = await pool.query(`
      SELECT index_name 
      FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
        AND table_name = 'todos' 
        AND index_name = 'idx_user_id';
    `);

    if (indexes.length === 0) {
      await pool.execute(`CREATE INDEX idx_user_id ON todos(user_id)`);
      console.log('Index idx_user_id created.');
    } else {
      console.log('Index idx_user_id already exists, skipping.');
    }

    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const runMigrations = async (): Promise<void> => {
  try {
    await createTables();
    console.log('Database migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

export { createTables, runMigrations };
