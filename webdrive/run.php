<?php
/**
 * run.php
 * Menjalankan file python di server. HANYA guru yang boleh menjalankan,
 * karena kode murid dieksekusi langsung di komputer/server ini.
 */
require 'auth.php';
require_post();
$user = require_login('guru');

$id   = intval($_POST['id'] ?? 0);
$file = find_file($conn, $id, $user);
if (!$file) {
    json_out(['status' => 'error', 'message' => 'File tidak ditemukan.'], 404);
}

$path = UPLOAD_DIR . $file['stored_name'];
if (!is_file($path)) {
    json_out(['status' => 'error', 'message' => 'File fisik tidak ditemukan di server.'], 404);
}

// Lepas kunci sesi supaya halaman lain tidak ikut menunggu selama program berjalan
session_write_close();

// Batas waktu (timeout) hanya dipasang di Linux/Mac. Perintah 'timeout' bawaan
// Windows (cmd.exe) beda syntax-nya dan tidak bisa membungkus perintah lain.
$isWindows = stripos(PHP_OS, 'WIN') === 0;

if ($isWindows) {
    $cmd = sprintf(
        '%s %s 2>&1',
        escapeshellcmd(PYTHON_BIN),
        escapeshellarg($path)
    );
} else {
    $cmd = sprintf(
        'timeout %d %s %s 2>&1',
        RUN_TIMEOUT_SECONDS,
        escapeshellcmd(PYTHON_BIN),
        escapeshellarg($path)
    );
}

$lines = [];
exec($cmd, $lines, $exitCode);
$output = implode("\n", $lines);

if (!$isWindows && $exitCode === 124) {
    $output .= "\n\n[Eksekusi dihentikan: melebihi batas waktu " . RUN_TIMEOUT_SECONDS . " detik]";
}

json_out([
    'status'    => 'ok',
    'filename'  => $file['original_name'],
    'exit_code' => (int)$exitCode,
    'output'    => $output !== '' ? $output : '(tidak ada output)',
]);
