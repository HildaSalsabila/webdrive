<?php
/**
 * setup_guru.php
 * Membuat akun guru PERTAMA. Setelah ada satu akun guru, endpoint ini menolak
 * semua permintaan, jadi orang lain tidak bisa mendaftar sebagai guru.
 */
require 'auth.php';

function guru_sudah_ada(mysqli $conn): bool {
    $res = $conn->query("SELECT id FROM users WHERE role = 'guru' LIMIT 1");
    if (!$res) {
        json_out(['status' => 'error', 'message' => 'Tabel users belum ada. Import database_v2.sql dulu di phpMyAdmin.'], 500);
    }
    return $res->num_rows > 0;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_out(['status' => 'ok', 'exists' => guru_sudah_ada($conn)]);
}

require_post();

if (guru_sudah_ada($conn)) {
    json_out(['status' => 'error', 'message' => 'Akun guru sudah ada. Setup ini sudah tidak bisa dipakai.'], 403);
}

$name     = trim($_POST['name'] ?? '');
$username = strtolower(trim($_POST['username'] ?? ''));
$password = $_POST['password'] ?? '';

if (strlen($name) < 2 || strlen($name) > 100) {
    json_out(['status' => 'error', 'message' => 'Nama harus 2-100 karakter.'], 422);
}
if (!preg_match('/^[a-z0-9_.]{3,30}$/', $username)) {
    json_out(['status' => 'error', 'message' => 'Username 3-30 karakter: huruf kecil, angka, titik, atau garis bawah.'], 422);
}
if (strlen($password) < 6) {
    json_out(['status' => 'error', 'message' => 'Password minimal 6 karakter.'], 422);
}

$cek = db_prepare($conn, 'SELECT id FROM users WHERE username = ?');
$cek->bind_param('s', $username);
$cek->execute();
if ($cek->get_result()->fetch_assoc()) {
    json_out(['status' => 'error', 'message' => 'Username sudah dipakai, coba yang lain.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$role = 'guru';
$stmt = db_prepare($conn, 'INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $username, $hash, $role);

if (!$stmt->execute()) {
    json_out(['status' => 'error', 'message' => 'Gagal membuat akun guru.'], 500);
}

json_out(['status' => 'ok', 'message' => 'Akun guru berhasil dibuat. Silakan login.']);
