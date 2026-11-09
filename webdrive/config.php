<?php
/**
 * config.php
 * Konfigurasi koneksi database + pengaturan umum aplikasi.
 * Sesuaikan DB_USER / DB_PASS dengan pengaturan server kamu (mis. XAMPP/Laragon).
 */

// ---- Konfigurasi Database ----
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'webdrive_db');

// ---- Konfigurasi Upload ----
define('UPLOAD_DIR', __DIR__ . '/uploads/');   // folder fisik penyimpanan file
define('ALLOWED_EXT', ['py']);                  // hanya file python
define('MAX_FILE_SIZE', 5 * 1024 * 1024);       // 5 MB

// ---- Konfigurasi Eksekusi Python ----
// Ganti 'python3' jadi 'python' kalau di server Windows / XAMPP python versi lama
define('PYTHON_BIN', 'python');
define('RUN_TIMEOUT_SECONDS', 5); // batas waktu eksekusi supaya tidak infinite loop

// ---- Koneksi ----
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die('Koneksi database gagal: ' . $conn->connect_error);
}
$conn->set_charset('utf8mb4');

// Buat folder uploads kalau belum ada
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
