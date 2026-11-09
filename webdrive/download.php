<?php
/** Unduh file. Guru: semua file. Murid: hanya file miliknya. */
require 'auth.php';

$user = current_user();
if (!$user) {
    header('Location: login.html');
    exit;
}

$id   = intval($_GET['id'] ?? 0);
$file = find_file($conn, $id, $user);
if (!$file) {
    http_response_code(404);
    exit('File tidak ditemukan atau kamu tidak punya akses.');
}

$path = UPLOAD_DIR . $file['stored_name'];
if (!is_file($path)) {
    http_response_code(404);
    exit('File fisik tidak ditemukan di server.');
}

session_write_close();

$downloadName = str_replace(['"', "\r", "\n"], '', basename($file['original_name']));
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Length: ' . filesize($path));
header('Cache-Control: no-cache, must-revalidate');
readfile($path);
exit;
