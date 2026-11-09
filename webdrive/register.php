<?php
/**
 * register.php - pendaftaran akun MURID.
 * (Akun guru dibuat lewat setup_guru.html, bukan dari sini.)
 */
require 'auth.php';
require_post();

$name     = trim($_POST['name'] ?? '');
$username = strtolower(trim($_POST['username'] ?? ''));
$password = $_POST['password'] ?? '';

if (strlen($name) < 2 || strlen($name) > 100) {
    json_out(['status' => 'error', 'message' => 'Nama lengkap harus 2-100 karakter.'], 422);
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
$role = 'murid';
$stmt = db_prepare($conn, 'INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $username, $hash, $role);

if (!$stmt->execute()) {
    json_out(['status' => 'error', 'message' => 'Gagal membuat akun. Coba lagi.'], 500);
}

// Langsung login setelah daftar
session_regenerate_id(true);
$_SESSION['wd_user'] = [
    'id'       => (int)$conn->insert_id,
    'name'     => $name,
    'username' => $username,
    'role'     => $role,
];

json_out(['status' => 'ok', 'redirect' => 'dashboard-murid.html']);
