/**
 * murid.js - dashboard murid: hanya melihat & mengelola tugas miliknya sendiri.
 */
const tableWrapper = document.getElementById('tableWrapper');
const uploadForm = document.getElementById('uploadForm');
const uploadBtn = document.getElementById('uploadBtn');
const summary = document.getElementById('summary');

let files = [];

async function loadFiles() {
    const data = await api('list.php');
    if (data.status !== 'ok') {
        tableWrapper.innerHTML = '<p class="empty">' + escapeHtml(data.message) + '</p>';
        return;
    }
    files = data.files;

    const done = files.filter(f => f.is_checked).length;
    summary.textContent = files.length ? '(' + done + ' dari ' + files.length + ' sudah diperiksa)' : '';

    if (files.length === 0) {
        tableWrapper.innerHTML = '<p class="empty">Belum ada tugas. Pilih file .py di atas lalu klik Unggah.</p>';
        return;
    }

    let html = '<div class="table-scroll"><table><thead><tr>' +
        '<th>Nama File</th><th>Keterangan</th><th>Ukuran</th><th>Dikumpulkan</th><th>Status</th><th>Aksi</th>' +
        '</tr></thead><tbody>';

    for (const f of files) {
        const deleteBtn = f.is_checked
            ? '<button class="btn btn-delete" disabled title="Sudah diperiksa guru, tidak bisa dihapus">🗑 Hapus</button>'
            : '<button class="btn btn-delete" data-action="delete" data-id="' + f.id + '">🗑 Hapus</button>';

        html += '<tr>' +
            '<td class="cell-name">' + escapeHtml(f.original_name) + '</td>' +
            '<td>' + escapeHtml(f.description || '-') + '</td>' +
            '<td>' + formatSize(f.filesize) + '</td>' +
            '<td>' + formatDate(f.uploaded_at) + '</td>' +
            '<td>' + statusBadge(f) + '</td>' +
            '<td class="actions">' +
                '<a class="btn btn-download" href="download.php?id=' + f.id + '">⬇ Unduh</a>' +
                deleteBtn +
            '</td></tr>';
    }

    html += '</tbody></table></div>';
    tableWrapper.innerHTML = html;
}

tableWrapper.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action="delete"]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const file = files.find(f => f.id === id);
    if (!file || !confirm('Yakin ingin menghapus "' + file.original_name + '"?')) return;

    const data = await postForm('delete.php', { id });
    showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
    if (data.status === 'ok') loadFiles();
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('pyfile');
    if (!fileInput.files.length) return;

    if (!fileInput.files[0].name.toLowerCase().endsWith('.py')) {
        showFlash('Hanya file Python (.py) yang bisa diunggah.', 'error');
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Mengunggah...';

    const data = await postForm('upload.php', {
        pyfile: fileInput.files[0],
        description: document.getElementById('description').value,
    });

    showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
    if (data.status === 'ok') {
        uploadForm.reset();
        loadFiles();
    }
    uploadBtn.disabled = false;
    uploadBtn.textContent = '⬆ Unggah';
});

(async function init() {
    const user = await requireRole('murid');
    if (user) loadFiles();
})();
