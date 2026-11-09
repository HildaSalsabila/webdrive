-- ============================================================
-- Web Drive Tugas Python - Database versi 2 (login guru & murid)
-- Aman dijalankan di database yang sudah ada (data lama tidak hilang).
-- Syntax "IF NOT EXISTS" pada ALTER memakai MariaDB (bawaan XAMPP).
-- ============================================================

CREATE DATABASE IF NOT EXISTS webdrive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webdrive_db;

-- Tabel akun (guru & murid)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('guru','murid') NOT NULL DEFAULT 'murid',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel file (dibuat kalau belum ada, lengkap dengan kolom baru)
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    user_id INT NULL,
    uploader VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    filesize INT NOT NULL DEFAULT 0,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_checked TINYINT(1) NOT NULL DEFAULT 0,
    checked_at DATETIME NULL,
    checked_by INT NULL
) ENGINE=InnoDB;

-- Kalau tabel files sudah ada dari versi lama, tambahkan kolom barunya
ALTER TABLE files
    ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER stored_name,
    ADD COLUMN IF NOT EXISTS is_checked TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS checked_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS checked_by INT NULL,
    ADD INDEX IF NOT EXISTS idx_files_user (user_id);
