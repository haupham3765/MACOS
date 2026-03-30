/* ============================================
   internet-manager.js - Quản lý Download/Upload
   Tốc độ phụ thuộc network speed
   ============================================ */

const InternetManagerApp = {
    winId: null,
    downloads: [],   // { id, name, icon, totalMB, downloadedMB, speed, status }
    uploads: [],
    tickCounter: 0,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('internet-manager', 'Downloads', html, {
            width: '58%', height: '72%'
        });
        this.bindEvents();
        return { id: 'internet-manager', winId: this.winId, ramUsage: 35 };
    },

    buildHTML() {
        let html = `
            <div style="padding:12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <h3 style="font-size:16px;font-weight:400;color:#fff">Quản lý tải xuống</h3>
                    <div style="display:flex;gap:8px">
                        <button class="glass-btn primary" id="dl-add">+ Tải file mới</button>
                        <button class="glass-btn" id="ul-add">↑ Upload</button>
                    </div>
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:12px">
                    Tốc độ mạng: ${SystemServices.getHardware('network').name} 
                    (↓${Utils.formatSpeed(SystemServices.getEffectiveDownloadSpeed())} / ↑${Utils.formatSpeed(SystemServices.getEffectiveUploadSpeed())})
                </div>
        `;

        if (this.downloads.length === 0 && this.uploads.length === 0) {
            html += `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">
                <div style="font-size:48px;margin-bottom:12px">📥</div>
                Chưa có file nào. Nhấn "Tải file mới" để bắt đầu.
            </div>`;
        }

        // Downloads
        this.downloads.forEach(dl => {
            const pct = (dl.downloadedMB / dl.totalMB * 100) || 0;
            const remaining = dl.speed > 0 ? (dl.totalMB - dl.downloadedMB) / dl.speed : 0;
            html += `
                <div class="download-item">
                    <div class="download-icon">${dl.icon}</div>
                    <div class="download-info">
                        <div class="download-name">↓ ${dl.name}</div>
                        <div class="download-stats">
                            ${Utils.formatSize(dl.downloadedMB)} / ${Utils.formatSize(dl.totalMB)}
                            ${dl.status === 'downloading' ? `| ${Utils.formatSpeed(dl.speed)} | Còn ${Utils.formatTime(remaining)}` : ''}
                            ${dl.status === 'done' ? '| ✅ Hoàn tất' : ''}
                            ${dl.status === 'paused' ? '| ⏸ Tạm dừng' : ''}
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${dl.status === 'done' ? 'success' : ''}" style="width:${pct}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Uploads
        this.uploads.forEach(ul => {
            const pct = (ul.uploadedMB / ul.totalMB * 100) || 0;
            html += `
                <div class="download-item">
                    <div class="download-icon">📤</div>
                    <div class="download-info">
                        <div class="download-name">↑ ${ul.name}</div>
                        <div class="download-stats">
                            ${Utils.formatSize(ul.uploadedMB)} / ${Utils.formatSize(ul.totalMB)}
                            ${ul.status === 'uploading' ? `| ${Utils.formatSpeed(ul.speed)}` : ''}
                            ${ul.status === 'done' ? '| ✅ Hoàn tất' : ''}
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${ul.status === 'done' ? 'success' : ''}" style="width:${pct}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        const dlBtn = body.querySelector('#dl-add');
        const ulBtn = body.querySelector('#ul-add');

        if (dlBtn) {
            dlBtn.addEventListener('click', () => this.addDownload());
        }
        if (ulBtn) {
            ulBtn.addEventListener('click', () => this.addUpload());
        }
    },

    addDownload() {
        const file = Utils.pick(DATA.downloadFiles);
        this.downloads.push({
            id: Utils.uid(),
            name: file.name,
            icon: file.icon,
            totalMB: file.size,
            downloadedMB: 0,
            speed: 0,
            status: 'downloading'
        });
        this.refresh();
    },

    addUpload() {
        const name = 'Upload_' + Utils.uid() + '.zip';
        const size = Utils.randInt(50, 5000);
        this.uploads.push({
            id: Utils.uid(),
            name: name,
            totalMB: size,
            uploadedMB: 0,
            speed: 0,
            status: 'uploading'
        });
        this.refresh();
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() { this.winId = null; },

    tick() {
        let needRefresh = false;

        // Cập nhật downloads
        this.downloads.forEach(dl => {
            if (dl.status === 'downloading') {
                const speed = SystemServices.getEffectiveDownloadSpeed();
                dl.speed = speed;
                dl.downloadedMB += speed;
                if (dl.downloadedMB >= dl.totalMB) {
                    dl.downloadedMB = dl.totalMB;
                    dl.status = 'done';
                    Desktop.notify('Downloads', `${dl.name} đã tải xong!`);
                }
                needRefresh = true;
            }
        });

        // Cập nhật uploads
        this.uploads.forEach(ul => {
            if (ul.status === 'uploading') {
                const speed = SystemServices.getEffectiveUploadSpeed();
                ul.speed = speed;
                ul.uploadedMB += speed;
                if (ul.uploadedMB >= ul.totalMB) {
                    ul.uploadedMB = ul.totalMB;
                    ul.status = 'done';
                    Desktop.notify('Downloads', `${ul.name} đã upload xong!`);
                }
                needRefresh = true;
            }
        });

        // Giới hạn danh sách (xóa file đã xong > 10 mục)
        if (this.downloads.length > 15) {
            this.downloads = this.downloads.filter(d => d.status !== 'done').concat(
                this.downloads.filter(d => d.status === 'done').slice(-5)
            );
        }

        if (needRefresh) this.refresh();
    }
};

AppManager.register('internet-manager', InternetManagerApp);
