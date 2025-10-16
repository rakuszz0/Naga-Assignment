import { pool } from '../config/database';
import { Todo, TodoInput, TodoUpdate } from '../types';

export class TodoModel {
  
  static async findByUserId(userId: number): Promise<Todo[]> {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as user_name 
       FROM todos t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.user_id = ? 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return rows as Todo[];
  }

  
  static async findByIdAndUserId(id: number, userId: number): Promise<Todo | null> {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as user_name 
       FROM todos t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    const todos = rows as Todo[];
    return todos[0] || null;
  }

  
  static async create(todoData: TodoInput & { user_id: number }): Promise<number> {
    const { title, description, user_id } = todoData;
    
    const [result] = await pool.execute(
      'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)',
      [title, description || null, user_id]
    );
    
    return (result as any).insertId;
  }

  
  static async update(id: number, userId: number, updates: TodoUpdate): Promise<boolean> {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.is_done !== undefined) {
      fields.push('is_done = ?');
      values.push(updates.is_done);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id, userId);

    const [result] = await pool.execute(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return (result as any).affectedRows > 0;
  }

  
  static async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return (result as any).affectedRows > 0;
  }

  
  static async findById(id: number): Promise<Todo | null> {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as user_name 
       FROM todos t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = ?`,
      [id]
    );
    const todos = rows as Todo[];
    return todos[0] || null;
  }

  
  static async findAll(): Promise<Todo[]> {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as user_name 
       FROM todos t 
       JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC`
    );
    return rows as Todo[];
  }

  
  static async findWithPagination(userId: number, page: number = 1, limit: number = 10): Promise<{ todos: Todo[]; total: number }> {
  try {
    const offset = (page - 1) * limit;

    console.log('=== USING TEMPLATE LITERAL SOLUTION ===');
    console.log('userId:', userId, 'page:', page, 'limit:', limit, 'offset:', offset);

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM todos WHERE user_id = ?',
      [userId]
    );
    const total = (countResult as any)[0].total;
    console.log('Total count:', total);

    const query = `
      SELECT t.*, u.name as user_name 
      FROM todos t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('Executing query with template literal');
    const [rows] = await pool.execute(query, [userId]);

    console.log('Query successful, rows found:', (rows as Todo[]).length);
    
    return {
      todos: rows as Todo[],
      total: parseInt(total)
    };
  } catch (error) {
    console.error('=== TEMPLATE LITERAL ERROR ===');
    console.error('Error details:', error);
    throw error;
  }
}
}