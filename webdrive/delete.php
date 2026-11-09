<?php
/**
 * Hapus file.
 * Guru  : boleh menghapus file apa pun.
 * Murid : hanya file miliknya, dan hanya selama belum diperiksa guru.
 */
require 'auth.php';
require_post();
$user = require_login();

$id   = intval($_POST['id'] ?? 0);
$file = find_file($conn, $id, $user);
if (!$file) {
    json_out(['status' => 'error', 'message' => 'File tidak ditemukan atau kamu tidak punya akses.'], 404);
}

if ($user['role'] === 'murid' && (int)$file['is_checked'] === 1) {
    json_out(['status' => 'error', 'message' => 'Tugas yang sudah diperiksa guru tidak bisa dihapus.'], 409);
}

$path = UPLOAD_DIR . $file['stored_name'];
if (is_file($path)) {
    @unlink($path);
}

$stmt = db_prepare($conn, 'DELETE FROM files WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();

json_out(['status' => 'ok', 'message' => 'File "' . $file['original_name'] . '" berhasil dihapus.']);
