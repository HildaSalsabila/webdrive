<?php
/**
 * auth.php
 * Dipakai oleh semua endpoint: sesi login + fungsi bantu hak akses.
 */
mysqli_report(MYSQLI_REPORT_OFF); // error query ditangani manual, perilaku sama di semua versi PHP
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    // Nama sesi khusus supaya tidak bentrok dengan project lain di localhost
    session_name('webdrive_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function json_out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function current_user(): ?array {
    return $_SESSION['wd_user'] ?? null;
}

/** Wajib login (dan wajib role tertentu kalau $role diisi). */
function require_login(?string $role = null): array {
    $user = current_user();
    if (!$user) {
        json_out(['status' => 'error', 'auth' => false, 'message' => 'Sesi habis, silakan login lagi.'], 401);
    }
    if ($role !== null && $user['role'] !== $role) {
        json_out(['status' => 'error', 'message' => 'Kamu tidak punya akses untuk aksi ini.'], 403);
    }
    return $user;
}

function require_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_out(['status' => 'error', 'message' => 'Metode request harus POST.'], 405);
    }
}

/** prepare() yang kasih pesan jelas kalau tabel/kolom belum ada. */
function db_prepare(mysqli $conn, string $sql): mysqli_stmt {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        json_out([
            'status'  => 'error',
            'message' => 'Query database gagal. Pastikan database_v2.sql sudah diimport di phpMyAdmin.',
        ], 500);
    }
    return $stmt;
}

/**
 * Ambil satu file milik user yang sedang login.
 * Guru boleh akses semua file, murid hanya file miliknya sendiri.
 */
function find_file(mysqli $conn, int $id, array $user): ?array {
    if ($user['role'] === 'guru') {
        $stmt = db_prepare($conn, 'SELECT * FROM files WHERE id = ?');
        $stmt->bind_param('i', $id);
    } else {
        $stmt = db_prepare($conn, 'SELECT * FROM files WHERE id = ? AND user_id = ?');
        $stmt->bind_param('ii', $id, $user['id']);
    }
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return $row ?: null;
}
