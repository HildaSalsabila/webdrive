<?php
/** Guru menandai tugas sudah / belum diperiksa. */
require 'auth.php';
require_post();
$user = require_login('guru');

$id      = intval($_POST['id'] ?? 0);
$checked = (($_POST['checked'] ?? '1') === '1');

$file = find_file($conn, $id, $user);
if (!$file) {
    json_out(['status' => 'error', 'message' => 'File tidak ditemukan.'], 404);
}

if ($checked) {
    $stmt = db_prepare($conn, 'UPDATE files SET is_checked = 1, checked_at = NOW(), checked_by = ? WHERE id = ?');
    $stmt->bind_param('ii', $user['id'], $id);
} else {
    $stmt = db_prepare($conn, 'UPDATE files SET is_checked = 0, checked_at = NULL, checked_by = NULL WHERE id = ?');
    $stmt->bind_param('i', $id);
}

if (!$stmt->execute()) {
    json_out(['status' => 'error', 'message' => 'Gagal menyimpan penanda.'], 500);
}

json_out([
    'status'  => 'ok',
    'message' => $checked ? 'Ditandai sudah diperiksa.' : 'Tanda diperiksa dibatalkan.',
]);
