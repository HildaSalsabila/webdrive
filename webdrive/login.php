<?php
require 'auth.php';
require_post();

$username = strtolower(trim($_POST['username'] ?? ''));
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    json_out(['status' => 'error', 'message' => 'Username dan password wajib diisi.'], 422);
}

$stmt = db_prepare($conn, 'SELECT id, name, username, password_hash, role FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['status' => 'error', 'message' => 'Username atau password salah.'], 401);
}

session_regenerate_id(true);
$_SESSION['wd_user'] = [
    'id'       => (int)$user['id'],
    'name'     => $user['name'],
    'username' => $user['username'],
    'role'     => $user['role'],
];

json_out([
    'status'   => 'ok',
    'role'     => $user['role'],
    'redirect' => $user['role'] === 'guru' ? 'dashboard-guru.html' : 'dashboard-murid.html',
]);
