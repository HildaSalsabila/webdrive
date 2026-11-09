/**
 * common.js
 * Fungsi bersama untuk semua halaman: pemanggilan API, cek login, format tampilan.
 */

const DASHBOARD = {
    guru: 'dashboard-guru.html',
    murid: 'dashboard-murid.html',
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

function formatDate(str) {
    if (!str) return '-';
    const d = new Date(String(str).replace(' ', 'T'));
    if (isNaN(d)) return str;
    return d.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function showFlash(message, type = 'success') {
    const flash = document.getElementById('flash');
    if (!flash) return;
    flash.textContent = message;
    flash.className = 'flash ' + type;
    flash.style.display = 'block';
    clearTimeout(showFlash._timer);
    showFlash._timer = setTimeout(() => { flash.style.display = 'none'; }, 4500);
}

/**
 * Panggil endpoint PHP dan selalu kembalikan objek { status, message, ... }.
 * Kalau server membalas selain JSON (misalnya error PHP), potongan pesannya
 * ditampilkan supaya gampang dilacak.
 */
async function api(url, options = {}) {
    let res;
    try {
        res = await fetch(url, { credentials: 'same-origin', ...options });
    } catch (err) {
        return {
            status: 'error',
            message: 'Gagal terhubung ke server. Pastikan Apache dan MySQL di XAMPP sudah menyala.',
        };
    }

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250);
        return { status: 'error', message: 'Server membalas dengan format tak terduga: ' + plain };
    }

    // Sesi habis -> kembali ke login (kecuali di halaman publik)
    if (data.auth === false && document.body.dataset.public !== 'true') {
        window.location.href = 'login.html';
    }
    return data;
}

function postForm(url, fields = {}) {
    const body = new FormData();
    for (const key of Object.keys(fields)) body.append(key, fields[key]);
    return api(url, { method: 'POST', body });
}

/** Pastikan sudah login dengan role yang benar, kalau tidak -> diarahkan. */
async function requireRole(role) {
    const data = await api('me.php');
    if (data.status !== 'ok') {
        window.location.href = 'login.html';
        return null;
    }
    if (data.user.role !== role) {
        window.location.href = DASHBOARD[data.user.role];
        return null;
    }
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = data.user.name;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await postForm('logout.php');
            window.location.href = 'login.html';
        });
    }
    return data.user;
}

function statusBadge(file) {
    if (file.is_checked) {
        const when = file.checked_at ? ' title="Diperiksa pada ' + escapeHtml(formatDate(file.checked_at)) + '"' : '';
        return '<span class="badge-status badge-ok"' + when + '>✓ Sudah diperiksa</span>';
    }
    return '<span class="badge-status badge-wait">Belum diperiksa</span>';
}
