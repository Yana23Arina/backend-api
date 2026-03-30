const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { username, email, password, full_name, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, role]
        );
        
        return result.insertId;
    }
    
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }
    
    static async findByUsername(username) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }
    
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    
    static async updateRole(userId, role) {
        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );
        return result;
    }
}

module.exports = User;