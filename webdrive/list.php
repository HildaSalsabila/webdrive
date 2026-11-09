<?php
/**
 * list.php
 * Guru  -> semua tugas dari semua murid (yang belum diperiksa tampil paling atas).
 * Murid -> hanya tugas miliknya sendiri.
 */
require 'auth.php';
$user = require_login();

$select = <<<SQL
SELECT f.id, f.original_name, f.description, f.filesize, f.uploaded_at,
       f.is_checked, f.checked_at,
       COALESCE(u.name, NULLIF(f.uploader, ''), 'Tidak diketahui') AS student_name,
       COALESCE(u.username, '') AS student_username
FROM files f
LEFT JOIN users u ON u.id = f.user_id
SQL;

if ($user['role'] === 'guru') {
    $result = $conn->query($select . ' ORDER BY f.is_checked ASC, f.uploaded_at DESC');
    if (!$result) {
        json_out(['status' => 'error', 'message' => 'Query database gagal. Pastikan database_v2.sql sudah diimport di phpMyAdmin.'], 500);
    }
} else {
    $stmt = db_prepare($conn, $select . ' WHERE f.user_id = ? ORDER BY f.uploaded_at DESC');
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
}

$files = [];
while ($row = $result->fetch_assoc()) {
    $files[] = [
        'id'               => (int)$row['id'],
        'original_name'    => $row['original_name'],
        'description'      => $row['description'],
        'filesize'         => (int)$row['filesize'],
        'uploaded_at'      => $row['uploaded_at'],
        'is_checked'       => (int)$row['is_checked'] === 1,
        'checked_at'       => $row['checked_at'],
        'student_name'     => $row['student_name'],
        'student_username' => $row['student_username'],
    ];
}

json_out(['status' => 'ok', 'files' => $files]);
