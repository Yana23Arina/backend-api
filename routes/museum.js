const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Цена одного билета (можно вынести в отдельную переменную)
const TICKET_PRICE = 500; // 500 рублей за билет

// Создание бронирования с ценой
router.post('/bookings', authenticateToken, async (req, res) => {
    try {
        const { visit_date, visitors_count } = req.body;
        const user_id = req.user.id;
        
        // Рассчитываем общую стоимость
        const total_price = visitors_count * TICKET_PRICE;
        
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, visit_date, visitors_count, price) VALUES (?, ?, ?, ?)',
            [user_id, visit_date, visitors_count, total_price]
        );
        
        res.status(201).json({
            message: 'Бронирование успешно создано',
            booking_id: result.insertId,
            total_price: total_price
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение бронирований пользователя с ценой
router.get('/bookings', authenticateToken, async (req, res) => {
    try {
        const [bookings] = await pool.execute(
            'SELECT * FROM bookings WHERE user_id = ? ORDER BY visit_date DESC',
            [req.user.id]
        );
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Отмена бронирования
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const [result] = await pool.execute(
            'DELETE FROM bookings WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Бронирование не найдено' });
        }
        
        res.json({ message: 'Бронирование успешно отменено' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение всех экспонатов
router.get('/exhibits', async (req, res) => {
    try {
        const [exhibits] = await pool.execute(
            'SELECT * FROM exhibits ORDER BY created_at DESC'
        );
        res.json(exhibits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение одного экспоната
router.get('/exhibits/:id', async (req, res) => {
    try {
        const [exhibits] = await pool.execute(
            'SELECT * FROM exhibits WHERE id = ?',
            [req.params.id]
        );
        
        if (exhibits.length === 0) {
            return res.status(404).json({ message: 'Экспонат не найден' });
        }
        
        res.json(exhibits[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;