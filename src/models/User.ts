import {pool} from '../config/database';
import bcrypt from 'bcrypt';
import {User, UserInput, UserResponse} from '../types';

export class UserModel {
    static async create(userData: UserInput): Promise<number> {
        const {name, email, password} = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return (result as any).insertId;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
        const users = rows as User[];
        return users[0] || null;
    }

    static async findById(id: number): Promise<UserResponse | null> {
        const [rows] = await pool.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [id]
        )
        const users = rows as UserResponse[];
        return users[0] || null;
    }

    static async findByIdWithPassword(id: number): Promise<User | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        const users = rows as User[];
        return users[0] || null;
    }

    static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findAll(): Promise<UserResponse[]> {
        const [rows] = await pool.execute(
          'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
        );
        return rows as UserResponse[];
    }

    static async update(id: number, updates: Partial<UserInput>): Promise<boolean> {
        const fields = [];
        const values = [];

        if (updates.name) {
          fields.push('name = ?');
          values.push(updates.name);
        }

        if (updates.email) {
          fields.push('email = ?');
          values.push(updates.email);
        }

        if (updates.password) {
          const hashedPassword = await bcrypt.hash(updates.password, 12);
          fields.push('password = ?');
          values.push(hashedPassword);
        }

        if (fields.length === 0) {
        return false;
        }

        values.push(id);

        const [result] = await pool.execute(
          `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
          values
        );

        return (result as any).affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return (result as any).affectedRows > 0;
    }

}