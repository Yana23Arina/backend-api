const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Middleware для проверки прав администратора
const checkAdmin = async (req, res, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
        }
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка проверки прав' });
    }
};

// Получение всех экспонатов (для админки)
router.get('/exhibits', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const [exhibits] = await pool.execute(
            'SELECT * FROM exhibits ORDER BY id DESC'
        );
        res.json(exhibits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка загрузки экспонатов' });
    }
});

// Добавление нового экспоната
router.post('/exhibits', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { title, description, image_url, period, artist, year_created } = req.body;
        
        // Валидация
        if (!title || !artist) {
            return res.status(400).json({ message: 'Название и художник обязательны' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO exhibits (title, description, image_url, period, artist, year_created) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || '', image_url || '', period || '', artist, year_created || null]
        );
        
        const [newExhibit] = await pool.execute(
            'SELECT * FROM exhibits WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Экспонат успешно добавлен',
            exhibit: newExhibit[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка добавления экспоната' });
    }
});

// Редактирование экспоната
router.put('/exhibits/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, period, artist, year_created } = req.body;
        
        const [result] = await pool.execute(
            `UPDATE exhibits 
             SET title = ?, description = ?, image_url = ?, period = ?, artist = ?, year_created = ?
             WHERE id = ?`,
            [title, description, image_url, period, artist, year_created, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Экспонат не найден' });
        }
        
        const [updatedExhibit] = await pool.execute(
            'SELECT * FROM exhibits WHERE id = ?',
            [id]
        );
        
        res.json({
            message: 'Экспонат успешно обновлен',
            exhibit: updatedExhibit[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления экспоната' });
    }
});

// Удаление экспоната
router.delete('/exhibits/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'DELETE FROM exhibits WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Экспонат не найден' });
        }
        
        res.json({ message: 'Экспонат успешно удален' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка удаления экспоната' });
    }
});

// Получение статистики
router.get('/stats', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const [exhibitsCount] = await pool.execute('SELECT COUNT(*) as count FROM exhibits');
        const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [bookingsCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
        
        res.json({
            exhibits: exhibitsCount[0].count,
            users: usersCount[0].count,
            bookings: bookingsCount[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка загрузки статистики' });
    }
});

module.exports = router;