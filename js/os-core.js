/* ============================================
   os-core.js - Lõi hệ điều hành
   Quản lý boot, login, trạng thái OS
   ============================================ */

const OS = {
    state: 'boot', // boot, login, desktop, sleep
    bootProgress: 0,
    tickInterval: null,
    tickRate: 1000, // 1 giây mỗi tick

    /**
     * Khởi động hệ thống
     */
    init() {
        this.boot();
    },

    /**
     * Quá trình boot
     */
    boot() {
        this.state = 'boot';
        const bootBar = document.getElementById('boot-progress-bar');
        const bootText = document.getElementById('boot-text');
        const messages = [
            'Đang khởi động...', 'Nạp kernel...', 'Khởi tạo phần cứng...',
            'Tải driver...', 'Khởi tạo hệ thống file...', 'Tải dịch vụ...',
            'Chuẩn bị desktop...'
        ];

        let progress = 0;
        const bootInterval = setInterval(() => {
            progress += Utils.rand(3, 8);
            if (progress >= 100) {
                progress = 100;
                clearInterval(bootInterval);
                bootBar.style.width = '100%';
                bootText.textContent = 'Hoàn tất!';
                setTimeout(() => this.showLogin(), 500);
            } else {
                bootBar.style.width = progress + '%';
                const msgIdx = Math.min(Math.floor(progress / 15), messages.length - 1);
                bootText.textContent = messages[msgIdx];
            }
        }, 200);
    },

    /**
     * Hiển thị màn hình đăng nhập
     */
    showLogin() {
        this.state = 'login';
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
            this.updateLoginClock();
            this._loginClockInterval = setInterval(() => this.updateLoginClock(), 1000);

            // Tự động focus vào ô nhập mật khẩu
            document.getElementById('login-password').focus();

            // Bind sự kiện login
            document.getElementById('login-btn').onclick = () => this.login();
            document.getElementById('login-password').onkeydown = (e) => {
                if (e.key === 'Enter') this.login();
            };
        }, 1000);
    },

    /**
     * Cập nhật đồng hồ login
     */
    updateLoginClock() {
        document.getElementById('login-time').textContent = Utils.getTimeStr();
        document.getElementById('login-date').textContent = Utils.getDateStr();
    },

    /**
     * Đăng nhập vào desktop
     */
    login() {
        if (this._loginClockInterval) clearInterval(this._loginClockInterval);
        this.state = 'desktop';

        document.getElementById('login-screen').style.opacity = '0';
        document.getElementById('login-screen').style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('desktop').style.display = 'block';
            this.startDesktop();
        }, 500);
    },

    /**
     * Khởi động desktop
     */
    startDesktop() {
        // Tải save nếu có
        SaveSystem.load();

        // Khởi tạo phần cứng
        SystemServices.init();

        // Khởi tạo app manager
        AppManager.init();

        // Khởi tạo desktop UI
        Desktop.init();

        // Bắt đầu game loop
        this.startTick();

        // Hiển thị thông báo chào mừng
        setTimeout(() => {
            Desktop.notify('macOS Liquid Glass', 'Chào mừng bạn! Hệ thống đã sẵn sàng.');
        }, 1000);
    },

    /**
     * Game loop - tick system
     */
    startTick() {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = setInterval(() => {
            if (this.state !== 'desktop') return;
            // Cập nhật hệ thống
            SystemServices.tick();
            // Cập nhật apps đang chạy
            AppManager.tick();
            // Cập nhật UI (menu bar time, etc.)
            Desktop.tick();
        }, this.tickRate);
    },

    /**
     * Ngủ
     */
    sleep() {
        this.state = 'sleep';
        SaveSystem.save();
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('login-screen').style.opacity = '1';
        this.updateLoginClock();
        this._loginClockInterval = setInterval(() => this.updateLoginClock(), 1000);
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
    },

    /**
     * Khởi động lại
     */
    restart() {
        SaveSystem.save();
        if (this.tickInterval) clearInterval(this.tickInterval);
        WindowManager.closeAll();
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('boot-screen').style.display = 'flex';
        document.getElementById('boot-screen').style.opacity = '1';
        document.getElementById('boot-progress-bar').style.width = '0%';
        this.boot();
    },

    /**
     * Tắt máy
     */
    shutdown() {
        SaveSystem.save();
        if (this.tickInterval) clearInterval(this.tickInterval);
        WindowManager.closeAll();
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('boot-screen').style.display = 'flex';
        document.getElementById('boot-screen').style.opacity = '1';
        document.getElementById('boot-progress-bar').style.width = '0%';
        document.getElementById('boot-text').textContent = 'Đã tắt máy. Nhấn để khởi động lại.';
        document.getElementById('boot-screen').onclick = () => {
            document.getElementById('boot-screen').onclick = null;
            this.boot();
        };
    }
};
