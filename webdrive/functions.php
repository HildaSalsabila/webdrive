<?php
/**
 * functions.php
 * Fungsi bantu yang dipakai di beberapa halaman.
 */

function format_size($bytes) {
    if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
    if ($bytes >= 1024) return round($bytes / 1024, 2) . ' KB';
    return $bytes . ' B';
}

function redirect_with_message($msg, $type = 'success') {
    $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
    header('Location: index.php');
    exit;
}
