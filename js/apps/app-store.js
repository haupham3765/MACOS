/* ============================================
   app-store.js - App Store
   Cài đặt / gỡ ứng dụng
   ============================================ */

const AppStoreApp = {
    winId: null,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('app-store', 'App Store', html, {
            width: 700, height: 550
        });
        this.bindEvents();
        return { id: 'app-store', winId: this.winId, ramUsage: 100 };
    },

    buildHTML() {
        // Phân loại
        const categories = {};
        DATA.storeApps.forEach(app => {
            if (!categories[app.category]) categories[app.category] = [];
            categories[app.category].push(app);
        });

        let html = `
            <div style="padding:16px">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                    <h2 style="font-size:22px;font-weight:400;color:#fff">App Store</h2>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5)">
                        Tiền: <span style="color:#FFD700;font-weight:600">${Utils.formatMoney(AppManager.money)}</span>
                    </div>
                </div>
        `;

        Object.entries(categories).forEach(([cat, apps]) => {
            html += `<div style="margin-bottom:20px">
                <h3 style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:10px;font-weight:500">${cat}</h3>
                <div class="app-grid">`;

            apps.forEach(app => {
                const installed = AppManager.isInstalled(app.id);
                const installing = !!AppManager.installing[app.id];
                let btnText = installed ? 'Đã cài' : 'Cài đặt';
                let btnClass = installed ? 'installed' : '';

                if (installing) {
                    btnText = 'Đang cài...';
                    btnClass = 'installing';
                }

                html += `
                    <div class="app-card" data-app-id="${app.id}">
                        <div class="app-card-icon">${DATA.appDefs[app.id]?.icon || '📱'}</div>
                        <div class="app-card-name">${app.name}</div>
                        <div class="app-card-size">${app.size} MB</div>
                        <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:6px">${app.desc}</div>
                        <button class="app-card-btn ${btnClass}" data-app-id="${app.id}" data-action="${installed ? 'uninstall' : 'install'}">
                            ${btnText}
                        </button>
                        <div class="install-progress" id="install-progress-${app.id}" style="display:${installing ? 'block' : 'none'}">
                            <div class="progress-bar">
                                <div class="progress-fill" id="install-fill-${app.id}" style="width:0%"></div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        });

        html += '</div>';
        return html;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        body.querySelectorAll('.app-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = btn.dataset.appId;
                const action = btn.dataset.action;

                if (action === 'install') {
                    this.startInstall(appId, btn);
                } else if (action === 'uninstall') {
                    AppManager.uninstallApp(appId);
                    this.refresh();
                }
            });
        });

        // Click card mở app nếu đã cài
        body.querySelectorAll('.app-card').forEach(card => {
            card.addEventListener('click', () => {
                const appId = card.dataset.appId;
                if (AppManager.isInstalled(appId)) {
                    AppManager.openApp(appId);
                }
            });
        });
    },

    startInstall(appId, btn) {
        btn.textContent = 'Đang cài...';
        btn.className = 'app-card-btn installing';
        btn.dataset.action = '';

        const progressEl = document.getElementById('install-progress-' + appId);
        const fillEl = document.getElementById('install-fill-' + appId);
        if (progressEl) progressEl.style.display = 'block';

        AppManager.installApp(appId,
            (progress) => {
                // Cập nhật progress
                if (fillEl) fillEl.style.width = progress + '%';
                btn.textContent = `${progress.toFixed(0)}%`;
            },
            () => {
                // Hoàn tất
                this.refresh();
            }
        );
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() {
        this.winId = null;
    },

    tick() {}
};

AppManager.register('app-store', AppStoreApp);
