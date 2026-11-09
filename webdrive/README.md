# Web Drive Tugas Python - Versi 2 (login guru & murid)

## Cara pasang di project yang sudah jalan
1. Import `database_v2.sql` lewat phpMyAdmin (tab SQL / Import). Data lama aman.
2. Extract isi zip ini ke folder project (mis. `C:\xampp2\htdocs\webdrive`) dan pilih "Replace".
   - `config.php` TIDAK ada di zip ini, jadi pengaturan database & PYTHON_BIN kamu tidak berubah.
   - Folder `uploads` tidak disentuh.
3. Buka `http://localhost/webdrive/setup_guru.html` dan buat akun guru (sekali saja).
4. Hapus `setup_guru.html` dan `setup_guru.php` setelah akun guru jadi.
5. Boleh hapus file lama yang sudah tidak dipakai: `app.js`, `functions.php`.
6. Buka `http://localhost/webdrive/` untuk masuk.

## Hak akses
| Aksi                         | Guru | Murid                          |
|------------------------------|------|--------------------------------|
| Lihat tugas                  | semua| hanya miliknya                 |
| Unggah tugas                 | -    | ya                             |
| Unduh                        | semua| hanya miliknya                 |
| Run (jalankan python)        | ya   | tidak                          |
| Tandai sudah/belum diperiksa | ya   | tidak (hanya melihat status)   |
| Hapus                        | semua| miliknya, selama belum diperiksa |

## Struktur
- Halaman: `index.html` (pengarah), `login.html`, `register.html`, `setup_guru.html`,
  `dashboard-guru.html`, `dashboard-murid.html`
- Script halaman: `common.js`, `auth.js`, `guru.js`, `murid.js`, `style.css`
- Backend PHP: `auth.php` (sesi & hak akses), `login.php`, `register.php`, `logout.php`, `me.php`,
  `list.php`, `upload.php`, `download.php`, `delete.php`, `check.php`, `run.php`, `setup_guru.php`
- Database: `database_v2.sql` (tabel `users`, tabel `files` + kolom `user_id`, `is_checked`, `checked_at`, `checked_by`)
