<?php
/** Mengembalikan data user yang sedang login (dipakai tiap halaman untuk cek sesi). */
require 'auth.php';
$user = require_login();
json_out(['status' => 'ok', 'user' => $user]);
