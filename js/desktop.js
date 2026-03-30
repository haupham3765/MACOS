/* ============================================
   desktop.js - Quản lý giao diện Desktop
   Menu bar, dock, icons, notifications
   ============================================ */

const Desktop = {
    notifTimeout: null,

    /**
     * Khởi tạo desktop
     */
    init() {
        this.setupMenuBar();
        this.setupDock();
        this.setupDesktopIcons();
        this.setupAppleMenu();
        this.tick();
    },

    /**
     * Setup menu bar
     */
    setupMenuBar() {
        document.getElementById('menu-time').textContent = Utils.getTimeStr();
    },

    /**
     * Setup Apple menu
     */
    setupAppleMenu() {
        const appleBtn = document.getElementById('menu-apple-btn');
        const appleMenu = document.getElementById('apple-menu');

        appleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            appleMenu.style.display = appleMenu.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            appleMenu.style.display = 'none';
        });

        // Menu actions
        document.getElementById('menu-about').addEventListener('click', () => {
            this.showAboutMac();
            appleMenu.style.display = 'none';
        });
        document.getElementById('menu-settings').addEventListener('click', () => {
            AppManager.openApp('settings');
            appleMenu.style.display = 'none';
        });
        document.getElementById('menu-appstore').addEventListener('click', () => {
            AppManager.openApp('app-store');
            appleMenu.style.display = 'none';
        });
        document.getElementById('menu-sleep').addEventListener('click', () => {
            OS.sleep();
            appleMenu.style.display = 'none';
        });
        document.getElementById('menu-restart').addEventListener('click', () => {
            OS.restart();
            appleMenu.style.display = 'none';
        });
        document.getElementById('menu-shutdown').addEventListener('click', () => {
            OS.shutdown();
            appleMenu.style.display = 'none';
        });
    },

    /**
     * Hiện About This Mac
     */
    showAboutMac() {
        const cpu = SystemServices.getHardware('cpu');
        const ram = SystemServices.getHardware('ram');
        const disk = SystemServices.getHardware('disk');
        const gpu = SystemServices.getHardware('gpu');
        const net = SystemServices.getHardware('network');

        const html = `
            <div class="about-mac">
                <div class="about-mac-logo">🍎</div>
                <h2>macOS Liquid Glass</h2>
                <div class="version">Version 1.0</div>
                <div class="about-mac-specs">
                    <div><strong>CPU:</strong> ${cpu.name} (${cpu.cores} cores, ${cpu.threads} threads)</div>
                    <div><strong>RAM:</strong> ${ram.name}</div>
                    <div><strong>Disk:</strong> ${disk.name}</div>
                    <div><strong>GPU:</strong> ${gpu.name}</div>
                    <div><strong>Network:</strong> ${net.name}</div>
                    <div><strong>Tiền:</strong> ${Utils.formatMoney(AppManager.money)}</div>
                </div>
            </div>
        `;

        WindowManager.create('about', 'Giới thiệu máy này', html, {
            width: 380, height: 380
        });
    },

    /**
     * Setup dock
     */
    setupDock() {
        const dockEl = document.getElementById('dock-items');
        dockEl.innerHTML = '';

        // App mặc định trong dock
        const dockApps = Object.entries(DATA.appDefs)
            .filter(([id, def]) => def.dock && AppManager.isInstalled(id));

        dockApps.forEach(([id, def]) => {
            const icon = document.createElement('div');
            icon.className = 'dock-icon' + (AppManager.isRunning(id) ? ' running' : '');
            icon.dataset.appId = id;
            icon.innerHTML = `
                <span>${def.icon}</span>
                <div class="dock-icon-tooltip">${def.name}</div>
            `;
            icon.addEventListener('click', () => AppManager.openApp(id));
            dockEl.appendChild(icon);
        });

        // Separator
        const sep = document.createElement('div');
        sep.className = 'dock-separator';
        dockEl.appendChild(sep);

        // App đã cài và đang chạy (không phải dock mặc định)
        const extraRunning = Object.keys(AppManager.running)
            .filter(id => !DATA.appDefs[id]?.dock);

        extraRunning.forEach(id => {
            const def = DATA.appDefs[id];
            if (!def) return;
            const icon = document.createElement('div');
            icon.className = 'dock-icon running';
            icon.dataset.appId = id;
            icon.innerHTML = `
                <span>${def.icon}</span>
                <div class="dock-icon-tooltip">${def.name}</div>
            `;
            icon.addEventListener('click', () => AppManager.openApp(id));
            dockEl.appendChild(icon);
        });
    },

    /**
     * Cập nhật trạng thái running trên dock
     */
    updateDockRunning() {
        this.setupDock();
    },

    /**
     * Setup desktop icons
     */
    setupDesktopIcons() {
        const container = document.getElementById('desktop-icons');
        container.innerHTML = '';

        // Hiển thị icon cho các app đã cài (trừ app mặc định trong dock)
        AppManager.installed.forEach(id => {
            if (DATA.defaultApps.includes(id)) return; // Không hiện app mặc định trên desktop
            this.createDesktopIcon(id, container);
        });
    },

    /**
     * Tạo icon trên desktop
     */
    createDesktopIcon(id, container) {
        const def = DATA.appDefs[id];
        if (!def) return;

        container = container || document.getElementById('desktop-icons');

        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.dataset.appId = id;
        icon.innerHTML = `
            <div class="desktop-icon-img">${def.icon}</div>
            <div class="desktop-icon-label">${def.name}</div>
        `;
        icon.addEventListener('dblclick', () => AppManager.openApp(id));
        icon.addEventListener('click', (e) => {
            // Bỏ chọn tất cả
            container.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
        container.appendChild(icon);
    },

    /**
     * Thêm icon mới lên desktop
     */
    addDesktopIcon(id) {
        if (DATA.defaultApps.includes(id)) return;
        const existing = document.querySelector(`.desktop-icon[data-app-id="${id}"]`);
        if (existing) return;
        this.createDesktopIcon(id);
    },

    /**
     * Xóa icon khỏi desktop
     */
    removeDesktopIcon(id) {
        const icon = document.querySelector(`.desktop-icon[data-app-id="${id}"]`);
        if (icon) icon.remove();
    },

    /**
     * Hiển thị thông báo
     */
    notify(title, body) {
        const area = document.getElementById('notification-area');
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-body">${body}</div>
        `;
        area.appendChild(notif);

        // Click để đóng
        notif.addEventListener('click', () => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        });

        // Tự đóng sau 4 giây
        setTimeout(() => {
            if (notif.parentNode) {
                notif.style.opacity = '0';
                setTimeout(() => notif.remove(), 300);
            }
        }, 4000);

        // Giới hạn số thông báo
        while (area.children.length > 3) {
            area.firstChild.remove();
        }
    },

    /**
     * Tick - cập nhật UI mỗi giây
     */
    tick() {
        // Cập nhật thời gian
        document.getElementById('menu-time').textContent = Utils.getTimeStr();

        // CPU indicator
        const cpuPct = SystemServices.stats.cpuTotal;
        const cpuEl = document.getElementById('menu-cpu-indicator');
        if (cpuPct > 80) cpuEl.textContent = '🔴';
        else if (cpuPct > 50) cpuEl.textContent = '🟡';
        else cpuEl.textContent = '🟢';
        cpuEl.title = `CPU: ${cpuPct.toFixed(0)}%`;

        // Battery (fake)
        document.getElementById('menu-battery').title = 'Pin: 100%';

        // Network
        const net = SystemServices.getHardware('network');
        document.getElementById('menu-wifi').title = `Network: ${net.name}`;
    },

    /**
     * Click ngoài desktop để bỏ chọn icon
     */
    setupDesktopClick() {
        document.getElementById('desktop').addEventListener('click', (e) => {
            if (e.target.id === 'desktop' || e.target.id === 'desktop-icons') {
                document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            }
        });
    }
};
