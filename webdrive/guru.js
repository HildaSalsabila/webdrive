/**
 * guru.js - dashboard guru: lihat semua tugas, tandai diperiksa, run, unduh, hapus.
 */
const tableWrapper = document.getElementById('tableWrapper');
const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');

const runModal = document.getElementById('runModal');
const runFilename = document.getElementById('runFilename');
const runPrompt = document.getElementById('runPrompt');
const runOutput = document.getElementById('runOutput');
const runStatus = document.getElementById('runStatus');
document.getElementById('closeModal').addEventListener('click', () => {
    runModal.style.display = 'none';
});

let allFiles = [];

async function loadFiles() {
    const data = await api('list.php');
    if (data.status !== 'ok') {
        tableWrapper.innerHTML = '<p class="empty">' + escapeHtml(data.message) + '</p>';
        return;
    }
    allFiles = data.files;
    updateStats();
    render();
}

function updateStats() {
    const done = allFiles.filter(f => f.is_checked).length;
    const students = new Set(allFiles.map(f => f.student_username || f.student_name));
    document.getElementById('statTotal').textContent = allFiles.length;
    document.getElementById('statPending').textContent = allFiles.length - done;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statStudents').textContent = students.size;
}

function render() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const shown = allFiles.filter(f => {
        if (status === 'pending' && f.is_checked) return false;
        if (status === 'done' && !f.is_checked) return false;
        if (!q) return true;
        return [f.student_name, f.student_username, f.original_name, f.description]
            .some(v => String(v || '').toLowerCase().includes(q));
    });

    if (allFiles.length === 0) {
        tableWrapper.innerHTML = '<p class="empty">Belum ada murid yang mengumpulkan tugas.</p>';
        return;
    }
    if (shown.length === 0) {
        tableWrapper.innerHTML = '<p class="empty">Tidak ada tugas yang cocok dengan pencarian atau filter.</p>';
        return;
    }

    let html = '<div class="table-scroll"><table><thead><tr>' +
        '<th>Murid</th><th>Nama File</th><th>Keterangan</th><th>Dikumpulkan</th><th>Status</th><th>Aksi</th>' +
        '</tr></thead><tbody>';

    for (const f of shown) {
        const username = f.student_username ? '<span class="cell-sub">@' + escapeHtml(f.student_username) + '</span>' : '';
        const checkBtn = f.is_checked
            ? '<button class="btn btn-uncheck" data-action="uncheck" data-id="' + f.id + '">↩ Batalkan tanda</button>'
            : '<button class="btn btn-check" data-action="check" data-id="' + f.id + '">✓ Tandai diperiksa</button>';

        html += '<tr class="' + (f.is_checked ? '' : 'row-pending') + '">' +
            '<td class="cell-name">' + escapeHtml(f.student_name) + username + '</td>' +
            '<td>' + escapeHtml(f.original_name) + '<span class="cell-sub">' + formatSize(f.filesize) + '</span></td>' +
            '<td>' + escapeHtml(f.description || '-') + '</td>' +
            '<td>' + formatDate(f.uploaded_at) + '</td>' +
            '<td>' + statusBadge(f) + '</td>' +
            '<td class="actions">' +
                '<button class="btn btn-run" data-action="run" data-id="' + f.id + '">▶ Run</button>' +
                '<a class="btn btn-download" href="download.php?id=' + f.id + '">⬇ Unduh</a>' +
                checkBtn +
                '<button class="btn btn-delete" data-action="delete" data-id="' + f.id + '">🗑 Hapus</button>' +
            '</td></tr>';
    }

    html += '</tbody></table></div>';
    tableWrapper.innerHTML = html;
}

searchInput.addEventListener('input', render);
statusFilter.addEventListener('change', render);

tableWrapper.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const file = allFiles.find(f => f.id === id);
    if (!file) return;

    switch (btn.dataset.action) {
        case 'run':
            runFile(file);
            break;
        case 'check':
        case 'uncheck': {
            btn.disabled = true;
            const data = await postForm('check.php', { id, checked: btn.dataset.action === 'check' ? '1' : '0' });
            showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
            loadFiles();
            break;
        }
        case 'delete': {
            if (!confirm('Hapus tugas "' + file.original_name + '" milik ' + file.student_name + '?')) return;
            const data = await postForm('delete.php', { id });
            showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
            if (data.status === 'ok') loadFiles();
            break;
        }
    }
});

async function runFile(file) {
    runFilename.textContent = file.original_name;
    runPrompt.innerHTML = '<span class="arrow">PS&gt;</span> <span class="cmd">python ' + escapeHtml(file.original_name) + '</span>';
    runOutput.textContent = 'Menjalankan...';
    runStatus.textContent = '';
    runStatus.className = 'terminal-status';
    runModal.style.display = 'flex';

    const data = await postForm('run.php', { id: file.id });

    if (data.status !== 'ok') {
        runOutput.textContent = data.message;
        runStatus.textContent = '✗ Gagal dijalankan';
        runStatus.className = 'terminal-status status-error';
        return;
    }

    runOutput.textContent = data.output;
    if (data.exit_code === 0) {
        runStatus.textContent = '✓ Selesai (exit code: 0)';
        runStatus.className = 'terminal-status status-ok';
    } else {
        runStatus.textContent = '✗ Selesai dengan error (exit code: ' + data.exit_code + ')';
        runStatus.className = 'terminal-status status-error';
    }
}

(async function init() {
    const user = await requireRole('guru');
    if (user) loadFiles();
})();
