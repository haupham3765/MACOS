/* ============================================
   finder.js - Finder App
   Quản lý file giả lập
   ============================================ */

const FinderApp = {
    open() {
        const html = `
            <div class="sidebar-layout">
                <div class="sidebar">
                    <div class="sidebar-section-title">Yêu thích</div>
                    <div class="sidebar-item active" data-path="home">🏠 Home</div>
                    <div class="sidebar-item" data-path="desktop">🖥️ Desktop</div>
                    <div class="sidebar-item" data-path="documents">📁 Documents</div>
                    <div class="sidebar-item" data-path="downloads">📥 Downloads</div>
                    <div class="sidebar-item" data-path="pictures">🖼️ Pictures</div>
                    <div class="sidebar-item" data-path="music">🎵 Music</div>
                </div>
                <div class="content-area">
                    <div class="finder-grid" id="finder-grid"></div>
                </div>
            </div>
        `;

        const winId = WindowManager.create('finder', 'Finder', html, {
            width: '72%', height: '78%'
        });

        // Render files
        this.renderFiles(winId);

        // Sidebar navigation
        const body = document.getElementById(winId + '-body');
        body.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                body.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.renderFiles(winId);
            });
        });

        return { id: 'finder', winId, ramUsage: 80 };
    },

    renderFiles(winId) {
        const grid = document.getElementById('finder-grid');
        if (!grid) return;

        grid.innerHTML = '';
        DATA.finderFiles.forEach(f => {
            const item = document.createElement('div');
            item.className = 'finder-item';
            item.innerHTML = `
                <div class="finder-item-icon">${f.icon}</div>
                <div class="finder-item-name">${f.name}</div>
            `;
            item.addEventListener('dblclick', () => {
                if (f.type === 'folder') {
                    Desktop.notify('Finder', `Đang mở thư mục: ${f.name}`);
                } else {
                    Desktop.notify('Finder', `Đang mở file: ${f.name}`);
                }
            });
            grid.appendChild(item);
        });
    },

    close() {},
    tick() {}
};

AppManager.register('finder', FinderApp);
