/**
 * app.js
 * Semua interaksi index.html (upload, list, run, download, delete)
 * dilakukan lewat fetch() ke endpoint PHP, tanpa reload halaman.
 */

const tableWrapper = document.getElementById('tableWrapper');
const fileCount = document.getElementById('fileCount');
const flash = document.getElementById('flash');
const uploadForm = document.getElementById('uploadForm');
const uploadBtn = document.getElementById('uploadBtn');

const runModal = document.getElementById('runModal');
const runFilename = document.getElementById('runFilename');
const runPrompt = document.getElementById('runPrompt');
const runOutput = document.getElementById('runOutput');
const runStatus = document.getElementById('runStatus');
document.getElementById('closeModal').addEventListener('click', () => {
    runModal.style.display = 'none';
});

function showFlash(message, type = 'success') {
    flash.textContent = message;
    flash.className = 'flash ' + type;
    flash.style.display = 'block';
    setTimeout(() => { flash.style.display = 'none'; }, 4000);
}

function formatSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

function formatDate(str) {
    const d = new Date(str.replace(' ', 'T'));
    return d.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// ---------- LOAD DAFTAR FILE ----------
async function loadFiles() {
    try {
        const res = await fetch('list.php');
        const data = await res.json();

        if (data.status !== 'ok') {
            tableWrapper.innerHTML = '<p class="empty">Gagal memuat data.</p>';
            return;
        }

        fileCount.textContent = data.files.length + ' file';

        if (data.files.length === 0) {
            tableWrapper.innerHTML = '<p class="empty">Belum ada file yang diunggah.</p>';
            return;
        }

        let html = `
        <table>
            <thead>
                <tr>
                    <th>Nama File</th>
                    <th>Pengumpul</th>
                    <th>Keterangan</th>
                    <th>Ukuran</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>`;

        for (const f of data.files) {
            html += `
                <tr>
                    <td>${escapeHtml(f.original_name)}</td>
                    <td>${escapeHtml(f.uploader || '-')}</td>
                    <td>${escapeHtml(f.description || '-')}</td>
                    <td>${formatSize(f.filesize)}</td>
                    <td>${formatDate(f.uploaded_at)}</td>
                    <td class="actions">
                        <button class="btn btn-run" onclick="runFile(${f.id})">▶ Run</button>
                        <a class="btn btn-download" href="download.php?id=${f.id}">⬇ Unduh</a>
                        <button class="btn btn-delete" onclick="deleteFile(${f.id}, '${escapeHtml(f.original_name)}')">🗑 Hapus</button>
                    </td>
                </tr>`;
        }

        html += '</tbody></table>';
        tableWrapper.innerHTML = html;
    } catch (err) {
        tableWrapper.innerHTML = '<p class="empty">Terjadi kesalahan saat memuat data.</p>';
    }
}

// ---------- UPLOAD ----------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('pyfile');
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append('pyfile', fileInput.files[0]);
    formData.append('uploader', document.getElementById('uploader').value);
    formData.append('description', document.getElementById('description').value);

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Mengunggah...';

    try {
        const res = await fetch('upload.php', { method: 'POST', body: formData });
        const data = await res.json();
        showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
        if (data.status === 'ok') {
            uploadForm.reset();
            loadFiles();
        }
    } catch (err) {
        showFlash('Gagal terhubung ke server.', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '⬆ Unggah';
    }
});

// ---------- RUN ----------
async function runFile(id) {
    runFilename.textContent = 'Terminal';
    runPrompt.innerHTML = '';
    runOutput.textContent = 'Menjalankan...';
    runStatus.textContent = '';
    runStatus.className = 'terminal-status';
    runModal.style.display = 'flex';

    try {
        const res = await fetch('run.php?id=' + id);
        const data = await res.json();

        if (data.status !== 'ok') {
            runFilename.textContent = 'Error';
            runOutput.textContent = data.message;
            runStatus.textContent = '✗ Gagal dijalankan';
            runStatus.className = 'terminal-status status-error';
            return;
        }

        runFilename.textContent = data.filename;
        runPrompt.innerHTML = `<span class="arrow">PS&gt;</span> <span class="cmd">python ${escapeHtml(data.filename)}</span>`;
        runOutput.textContent = data.output;

        if (data.exit_code === 0) {
            runStatus.textContent = '✓ Selesai (exit code: 0)';
            runStatus.className = 'terminal-status status-ok';
        } else {
            runStatus.textContent = '✗ Selesai dengan error (exit code: ' + data.exit_code + ')';
            runStatus.className = 'terminal-status status-error';
        }
    } catch (err) {
        runFilename.textContent = 'Error';
        runOutput.textContent = 'Terjadi kesalahan saat menjalankan file.';
        runStatus.textContent = '✗ Gagal terhubung ke server';
        runStatus.className = 'terminal-status status-error';
    }
}

// ---------- DELETE ----------
async function deleteFile(id, name) {
    if (!confirm('Yakin ingin menghapus "' + name + '"?')) return;

    try {
        const res = await fetch('delete.php?id=' + id, { method: 'POST' });
        const data = await res.json();
        showFlash(data.message, data.status === 'ok' ? 'success' : 'error');
        if (data.status === 'ok') loadFiles();
    } catch (err) {
        showFlash('Gagal terhubung ke server.', 'error');
    }
}

// ---------- INIT ----------
loadFiles();
