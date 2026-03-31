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

        // Проверка обязательных полей
        if (!visit_date || !visitors_count) {
            return res.status(400).json({ 
                message: 'Пожалуйста, укажите дату посещения и количество посетителей' 
            });
        }

        // Проверка, что количество посетителей положительное
        if (visitors_count < 1) {
            return res.status(400).json({ 
                message: 'Количество посетителей должно быть не менее 1' 
            });
        }

        const total_price = visitors_count * TICKET_PRICE;

        const result = await pool.query(
            `INSERT INTO bookings (user_id, visit_date, visitors_count, price, status) 
             VALUES ($1, $2, $3, $4, 'pending') 
             RETURNING id, visit_date, visitors_count, price, status, created_at`,
            [user_id, visit_date, visitors_count, total_price]
        );

        res.status(201).json({
            message: 'Бронирование успешно создано',
            booking: result.rows[0],
            total_price: total_price
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при создании бронирования',
            error: error.message 
        });
    }
});

// Получение бронирований пользователя
router.get('/bookings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, visit_date, visitors_count, price, status, created_at 
             FROM bookings 
             WHERE user_id = $1 
             ORDER BY visit_date DESC, created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при загрузке бронирований',
            error: error.message 
        });
    }
});

// Отмена бронирования
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Сначала проверяем, существует ли бронирование и принадлежит ли пользователю
        const checkResult = await pool.query(
            'SELECT id, status FROM bookings WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Бронирование не найдено' });
        }

        if (checkResult.rows[0].status === 'cancelled') {
            return res.status(400).json({ message: 'Бронирование уже отменено' });
        }

        // Обновляем статус вместо удаления
        const result = await pool.query(
            `UPDATE bookings 
             SET status = 'cancelled' 
             WHERE id = $1 AND user_id = $2 
             RETURNING id, status`,
            [id, user_id]
        );

        res.json({ 
            message: 'Бронирование успешно отменено',
            booking: result.rows[0]
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при отмене бронирования',
            error: error.message 
        });
    }
});

// Получение всех экспонатов
router.get('/exhibits', async (req, res) => {
    try {
        console.log('Fetching exhibits from database...');
        
        const result = await pool.query(
            'SELECT id, title, description, period, artist, year_created, created_at FROM exhibits ORDER BY created_at DESC'
        );
        
        console.log(`Found ${result.rows.length} exhibits`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching exhibits:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при загрузке экспонатов',
            error: error.message 
        });
    }
});

// Получение одного экспоната
router.get('/exhibits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Проверяем, что id - число
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Неверный ID экспоната' });
        }
        
        const result = await pool.query(
            'SELECT id, title, description, period, artist, year_created, created_at FROM exhibits WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Экспонат не найден' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching exhibit:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при загрузке экспоната',
            error: error.message 
        });
    }
});

module.exports = router;
