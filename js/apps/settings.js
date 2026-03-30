/* ============================================
   settings.js - System Settings
   Cài đặt hệ thống, thông tin máy
   ============================================ */

const SettingsApp = {
    winId: null,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('settings', 'Cài đặt hệ thống', html, {
            width: '62%', height: '78%'
        });
        this.bindEvents();
        return { id: 'settings', winId: this.winId, ramUsage: 40 };
    },

    buildHTML() {
        const cpu = SystemServices.getHardware('cpu');
        const ram = SystemServices.getHardware('ram');
        const disk = SystemServices.getHardware('disk');
        const gpu = SystemServices.getHardware('gpu');
        const net = SystemServices.getHardware('network');
        const stats = SystemServices.stats;

        return `
            <div class="sidebar-layout">
                <div class="sidebar">
                    <div class="sidebar-section-title">Cài đặt</div>
                    <div class="sidebar-item active">📱 Tổng quan</div>
                    <div class="sidebar-item" data-section="storage">💾 Lưu trữ</div>
                    <div class="sidebar-item" data-section="about">ℹ️ Giới thiệu</div>
                </div>
                <div class="content-area">
                    <h2 style="font-size:20px;font-weight:400;margin-bottom:16px;color:#fff">Tổng quan hệ thống</h2>

                    <div class="glass-panel">
                        <div class="settings-item">
                            <span class="settings-label">🔲 CPU</span>
                            <span class="settings-value">${cpu.name}</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">💾 RAM</span>
                            <span class="settings-value">${ram.name} (${Utils.formatSize(stats.ramUsed)} / ${Utils.formatSize(stats.ramTotal)})</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">💽 Disk</span>
                            <span class="settings-value">${disk.name} (${Utils.formatSize(stats.diskUsed)} / ${Utils.formatSize(stats.diskTotal)})</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">🎮 GPU</span>
                            <span class="settings-value">${gpu.name}</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">📶 Network</span>
                            <span class="settings-value">${net.name}</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">💰 Số dư</span>
                            <span class="settings-value" style="color:#FFD700">${Utils.formatMoney(AppManager.money)}</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">⚡ Hiệu năng</span>
                            <span class="settings-value">${SystemServices.perfMultiplier.toFixed(1)}x</span>
                        </div>
                    </div>

                    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
                        <button class="glass-btn primary" id="settings-save">💾 Lưu game</button>
                        <button class="glass-btn" id="settings-load">📂 Tải game</button>
                        <button class="glass-btn danger" id="settings-reset">🗑️ Xóa dữ liệu</button>
                        <button class="glass-btn success" id="settings-add-money">💰 +$10,000 (Debug)</button>
                    </div>

                    <div style="margin-top:16px">
                        <h3 style="font-size:14px;font-weight:400;color:rgba(255,255,255,0.6);margin-bottom:8px">App đã cài đặt</h3>
                        <div style="display:flex;flex-wrap:wrap;gap:8px">
                            ${Array.from(AppManager.installed).map(id => {
                                const def = DATA.appDefs[id];
                                return def ? `<span class="glass-btn" style="font-size:11px;padding:4px 10px">${def.icon} ${def.name}</span>` : '';
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        body.querySelector('#settings-save')?.addEventListener('click', () => {
            if (SaveSystem.save()) {
                Desktop.notify('Settings', 'Đã lưu game thành công!');
            } else {
                Desktop.notify('Settings', 'Lưu game thất bại!');
            }
        });

        body.querySelector('#settings-load')?.addEventListener('click', () => {
            if (SaveSystem.load()) {
                Desktop.notify('Settings', 'Đã tải game thành công!');
                this.refresh();
            } else {
                Desktop.notify('Settings', 'Không tìm thấy dữ liệu lưu!');
            }
        });

        body.querySelector('#settings-reset')?.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu?')) {
                SaveSystem.clear();
                Desktop.notify('Settings', 'Đã xóa dữ liệu!');
            }
        });

        body.querySelector('#settings-add-money')?.addEventListener('click', () => {
            AppManager.addMoney(10000);
            Desktop.notify('Settings', '+$10,000 đã được thêm!');
            this.refresh();
        });
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() { this.winId = null; },
    tick() {}
};

AppManager.register('settings', SettingsApp);
