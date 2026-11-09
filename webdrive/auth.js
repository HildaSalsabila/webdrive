/**
 * auth.js
 * Dipakai oleh: index.html (pengarah), login.html, register.html, setup_guru.html
 */
(async function () {
    const page = document.body.dataset.page;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const setupForm = document.getElementById('setupForm');

    // ---- index.html: selalu mulai dari halaman login ----
    if (page === 'index') {
        window.location.replace('login.html');
        return;
    }

    // ---- daftar: kalau sudah login, langsung ke dashboard ----
    // Halaman login tetap ditampilkan meskipun sesi sebelumnya masih aktif,
    // agar pengguna bisa memilih akun dan masuk dengan kredensialnya.
    if (registerForm) {
        const me = await api('me.php');
        if (me.status === 'ok') {
            window.location.replace(DASHBOARD[me.user.role]);
            return;
        }
    }

    function lockButton(btn, text) {
        btn.disabled = true;
        btn.dataset.label = btn.textContent;
        btn.textContent = text;
    }
    function unlockButton(btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.label;
    }

    // ---- Login ----
    if (loginForm) {
        const btn = document.getElementById('loginBtn');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            lockButton(btn, 'Memeriksa...');
            const data = await postForm('login.php', {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
            });
            if (data.status === 'ok') {
                window.location.href = data.redirect;
            } else {
                showFlash(data.message, 'error');
                unlockButton(btn);
            }
        });
    }

    // ---- Daftar murid ----
    if (registerForm) {
        const btn = document.getElementById('registerBtn');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            if (password !== document.getElementById('password2').value) {
                showFlash('Konfirmasi password tidak sama.', 'error');
                return;
            }
            lockButton(btn, 'Membuat akun...');
            const data = await postForm('register.php', {
                name: document.getElementById('name').value,
                username: document.getElementById('username').value,
                password: password,
            });
            if (data.status === 'ok') {
                window.location.href = data.redirect;
            } else {
                showFlash(data.message, 'error');
                unlockButton(btn);
            }
        });
    }

    // ---- Setup akun guru (sekali pakai) ----
    if (setupForm) {
        const btn = document.getElementById('setupBtn');
        const info = await api('setup_guru.php');
        if (info.status !== 'ok') {
            showFlash(info.message, 'error');
        } else if (info.exists) {
            setupForm.style.display = 'none';
            document.getElementById('setupDone').style.display = 'block';
        }

        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            if (password !== document.getElementById('password2').value) {
                showFlash('Konfirmasi password tidak sama.', 'error');
                return;
            }
            lockButton(btn, 'Membuat akun...');
            const data = await postForm('setup_guru.php', {
                name: document.getElementById('name').value,
                username: document.getElementById('username').value,
                password: password,
            });
            if (data.status === 'ok') {
                window.location.href = 'login.html';
            } else {
                showFlash(data.message, 'error');
                unlockButton(btn);
            }
        });
    }
})();
