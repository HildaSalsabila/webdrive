-- ============================================
-- Database: webdrive_db
-- Web Drive Tugas Python - Skema Database
-- ============================================

CREATE DATABASE IF NOT EXISTS webdrive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webdrive_db;

CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    uploader VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    filesize INT NOT NULL DEFAULT 0,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
