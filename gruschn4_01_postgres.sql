-- PostgreSQL compatible dump

-- Создание таблицы users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы exhibits
DROP TABLE IF EXISTS exhibits;
CREATE TABLE exhibits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    period VARCHAR(100),
    artist VARCHAR(200),
    year_created INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Данные для exhibits
INSERT INTO exhibits (id, title, description, image_url, period, artist, year_created, created_at) VALUES
(1, 'Звездная ночь', 'Знаменитая картина Винсента Ван Гога', 'https://images.metmuseum.org/CRDImages/ep/original/DP-17086-001.jpg', 'Постимпрессионизм', 'Винсент Ван Гог', 1889, '2026-03-30 17:12:29'),
(2, 'Мона Лиза', 'Шедевр Леонардо да Винчи', 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', 'Ренессанс', 'Леонардо да Винчи', 1503, '2026-03-30 17:12:29'),
(3, 'Мыслитель', 'Скульптура Огюста Родена', 'https://www.rodinmuseum.org/sites/default/files/styles/wide_3x2/public/images/2020-04/Thinker_Colonnade_0.jpg', 'Модерн', 'Огюст Роден', 1902, '2026-03-30 17:12:29'),
(4, 'Постоянство памяти', 'Сюрреалистическая картина Сальвадора Дали', 'https://www.moma.org/media/W1siZiIsIjMxOTk0MiJdXQ', 'Сюрреализм', 'Сальвадор Дали', 1931, '2026-03-30 17:12:29'),
(5, 'Крик', 'Экспрессионистская картина Эдварда Мунка', 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg', 'Экспрессионизм', 'Эдвард Мунк', 1893, '2026-03-30 17:12:29');

-- Создание таблицы bookings
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visitors_count INTEGER NOT NULL,
    price NUMERIC(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
