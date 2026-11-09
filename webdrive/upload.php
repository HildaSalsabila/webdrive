<?php
/** Upload tugas - hanya untuk murid. Nama pengumpul diambil dari akun, bukan diketik. */
require 'auth.php';
require_post();
$user = require_login('murid');

if (!isset($_FILES['pyfile'])) {
    json_out(['status' => 'error', 'message' => 'Tidak ada file yang dikirim.'], 400);
}

$file = $_FILES['pyfile'];
$description = trim($_POST['description'] ?? '');

if ($file['error'] !== UPLOAD_ERR_OK) {
    json_out(['status' => 'error', 'message' => 'Upload gagal (kode error: ' . $file['error'] . ').'], 400);
}
if ($file['size'] > MAX_FILE_SIZE) {
    json_out(['status' => 'error', 'message' => 'Ukuran file melebihi batas maksimum (5 MB).'], 413);
}

$originalName = basename($file['name']);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_EXT, true)) {
    json_out(['status' => 'error', 'message' => 'Hanya file Python (.py) yang diperbolehkan.'], 415);
}

$storedName  = uniqid('task_', true) . '.py';
$destination = UPLOAD_DIR . $storedName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_out(['status' => 'error', 'message' => 'Gagal menyimpan file ke server.'], 500);
}

$filesize = filesize($destination);
$stmt = db_prepare(
    $conn,
    'INSERT INTO files (original_name, stored_name, user_id, uploader, description, filesize) VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->bind_param('ssissi', $originalName, $storedName, $user['id'], $user['name'], $description, $filesize);

if (!$stmt->execute()) {
    @unlink($destination);
    json_out(['status' => 'error', 'message' => 'Gagal menyimpan data ke database.'], 500);
}

json_out(['status' => 'ok', 'message' => 'File "' . $originalName . '" berhasil diunggah.']);
