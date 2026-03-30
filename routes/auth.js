const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const pool = require('../config/database');

// Регистрация
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Имя пользователя должно содержать минимум 3 символа'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
], async (req, res) => {
    try {
        console.log('\n========== REGISTRATION START ==========');
        console.log('Request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, email, password, full_name } = req.body;
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password length:', password.length);
        console.log('Full name:', full_name);
        
        console.log('Checking if user exists by email...');
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }
        
        console.log('Checking if username exists...');
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
        }
        
        console.log('Creating user...');
        const userId = await User.create({ username, email, password, full_name, role: 'user' });
        console.log('User created with ID:', userId);
        
        console.log('Finding user by ID...');
        const user = await User.findById(userId);
        console.log('User found:', user);
        
        console.log('Generating token...');
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'museum_secret_key',
            { expiresIn: '24h' }
        );
        console.log('Token generated successfully');
        
        console.log('Registration successful!');
        console.log('========== REGISTRATION END ==========\n');
        
        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('\n========== REGISTRATION ERROR ==========');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========== ERROR END ==========\n');
        res.status(500).json({ 
            message: 'Ошибка сервера', 
            error: error.message,
            details: error.toString()
        });
    }
});

// Авторизация
router.post('/login', [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
], async (req, res) => {
    try {
        console.log('\n========== LOGIN START ==========');
        console.log('Request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { email, password } = req.body;
        console.log('Email:', email);
        
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        
        console.log('User found, checking password...');
        const isValidPassword = await User.comparePassword(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        
        console.log('Password valid, generating token...');
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'museum_secret_key',
            { expiresIn: '24h' }
        );
        
        console.log('Login successful!');
        console.log('User role:', user.role);
        console.log('========== LOGIN END ==========\n');
        
        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('\n========== LOGIN ERROR ==========');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========== ERROR END ==========\n');
        res.status(500).json({ 
            message: 'Ошибка сервера', 
            error: error.message,
            details: error.toString()
        });
    }
});

// Получение информации о пользователе
router.get('/me', authenticateToken, async (req, res) => {
    try {
        console.log('\n========== GET ME START ==========');
        console.log('User ID from token:', req.user.id);
        
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            console.log('User not found with ID:', req.user.id);
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        const user = users[0];
        console.log('User found:', user);
        console.log('User role:', user.role);
        console.log('========== GET ME END ==========\n');
        
        res.json(user);
    } catch (error) {
        console.error('\n========== GET ME ERROR ==========');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========== ERROR END ==========\n');
        res.status(500).json({ 
            message: 'Ошибка сервера', 
            error: error.message,
            details: error.toString()
        });
    }
});

// Обновление профиля
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name } = req.body;
        
        await pool.execute(
            'UPDATE users SET full_name = ? WHERE id = ?',
            [full_name, req.user.id]
        );
        
        res.json({ message: 'Профиль обновлен успешно' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
});

// Смена пароля
router.put('/password', authenticateToken, [
    body('current_password').notEmpty().withMessage('Введите текущий пароль'),
    body('new_password').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { current_password, new_password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        const isValid = await User.comparePassword(current_password, users[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Неверный текущий пароль' });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка смены пароля' });
    }
});

module.exports = router;