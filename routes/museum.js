// routes/museum.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // PostgreSQL Pool
const authenticateToken = require('../middleware/auth');

// Цена одного билета
const TICKET_PRICE = 500; // 500 рублей

// Создание бронирования с ценой
router.post('/bookings', authenticateToken, async (req, res) => {
    try {
        const { visit_date, visitors_count } = req.body;
        const user_id = req.user.id;

        const total_price = visitors_count * TICKET_PRICE;

        const result = await pool.query(
            'INSERT INTO bookings (user_id, visit_date, visitors_count, price) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, visit_date, visitors_count, total_price]
        );

        res.status(201).json({
            message: 'Бронирование успешно создано',
            booking_id: result.rows[0].id,
            total_price: total_price
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение бронирований пользователя
router.get('/bookings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM bookings WHERE user_id = $1 ORDER BY visit_date DESC',
            [req.user.id]
        );
        res.json(result.rows);
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

        const result = await pool.query(
            'DELETE FROM bookings WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (result.rowCount === 0) {
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
        const result = await pool.query(
            'SELECT * FROM exhibits ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение одного экспоната
router.get('/exhibits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM exhibits WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Экспонат не найден' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
