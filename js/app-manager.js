/* ============================================
   app-manager.js - Quản lý ứng dụng
   Cài đặt, gỡ, mở, tick các app
   ============================================ */

const AppManager = {
    // Danh sách app đã cài đặt (id set)
    installed: new Set(),
    // App đang chạy (id -> app instance)
    running: {},
    // App đang cài đặt (id -> progress)
    installing: {},
    // Registry: id -> app module
    registry: {},
    // Tiền chung cho tất cả hệ thống
    money: 5000,

    /**
     * Khởi tạo
     */
    init() {
        // Đăng ký tất cả app module
        this.registerAll();

        // Cài app mặc định
        DATA.defaultApps.forEach(id => this.installed.add(id));

        // Khởi tạo WindowManager
        WindowManager.init();
    },

    /**
     * Đăng ký app module vào registry
     */
    registerAll() {
        // Các app sẽ tự đăng ký qua AppManager.register()
    },

    /**
     * Đăng ký một app
     */
    register(id, module) {
        this.registry[id] = module;
    },

    /**
     * Kiểm tra app đã cài chưa
     */
    isInstalled(id) {
        return this.installed.has(id);
    },

    /**
     * Kiểm tra app đang chạy
     */
    isRunning(id) {
        return !!this.running[id];
    },

    /**
     * Lấy danh sách app đang chạy
     */
    getRunningApps() {
        return Object.values(this.running);
    },

    /**
     * Cài đặt app từ store
     */
    installApp(id, onProgress, onComplete) {
        if (this.installed.has(id)) return;
        if (this.installing[id]) return;

        const storeApp = DATA.storeApps.find(a => a.id === id);
        if (!storeApp) return;

        // Bắt đầu cài đặt
        this.installing[id] = { progress: 0, size: storeApp.size };

        const installInterval = setInterval(() => {
            const inst = this.installing[id];
            if (!inst) {
                clearInterval(installInterval);
                return;
            }

            // Tốc độ cài phụ thuộc vào disk speed và CPU
            const disk = SystemServices.getHardware('disk');
            const speedFactor = (disk.writeSpeed / 100) * SystemServices.perfMultiplier;
            inst.progress += Utils.rand(2, 5) * Math.min(speedFactor, 3);

            if (inst.progress >= 100) {
                inst.progress = 100;
                clearInterval(installInterval);

                // Hoàn tất cài đặt
                this.installed.add(id);
                SystemServices.addDiskUsage(storeApp.size);
                delete this.installing[id];

                if (onComplete) onComplete();
                Desktop.addDesktopIcon(id);
                Desktop.notify('App Store', `${storeApp.name} đã cài đặt thành công!`);
            }

            if (onProgress) onProgress(Math.min(inst.progress, 100));
        }, 300);
    },

    /**
     * Gỡ cài đặt app
     */
    uninstallApp(id) {
        if (!this.installed.has(id)) return;
        if (DATA.defaultApps.includes(id)) return; // Không gỡ app mặc định

        // Đóng nếu đang chạy
        if (this.running[id]) {
            this.closeApp(id);
        }

        this.installed.delete(id);
        const storeApp = DATA.storeApps.find(a => a.id === id);
        if (storeApp) {
            SystemServices.freeDisk(storeApp.size);
        }

        Desktop.removeDesktopIcon(id);
        Desktop.notify('App Store', `Đã gỡ cài đặt ${DATA.appDefs[id]?.name || id}`);
    },

    /**
     * Mở app
     */
    openApp(id) {
        if (!this.installed.has(id)) return;

        // Nếu đang chạy, focus cửa sổ
        if (this.running[id]) {
            WindowManager.focusApp(id);
            return;
        }

        const module = this.registry[id];
        if (!module) {
            // App chưa có module → hiện thông báo
            const appDef = DATA.appDefs[id];
            const winId = WindowManager.create(id, appDef?.name || id,
                `<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column">
                    <div style="font-size:64px;margin-bottom:16px">${appDef?.icon || '📱'}</div>
                    <div style="font-size:16px;color:rgba(255,255,255,0.7)">${appDef?.name || id}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px">Ứng dụng đang được phát triển...</div>
                </div>`
            );
            this.running[id] = { id, winId, ramUsage: 30 };
            SystemServices.addRamUsage(30);
            Desktop.updateDockRunning();
            return;
        }

        // Mở app module
        const appInstance = module.open();
        if (appInstance) {
            this.running[id] = appInstance;
            this.running[id].id = id;
            SystemServices.addRamUsage(appInstance.ramUsage || 50);
            Desktop.updateDockRunning();
        }
    },

    /**
     * Đóng app
     */
    closeApp(id) {
        const app = this.running[id];
        if (!app) return;

        SystemServices.freeRam(app.ramUsage || 50);

        // Gọi cleanup nếu có
        const module = this.registry[id];
        if (module && module.close) {
            module.close();
        }

        delete this.running[id];
        Desktop.updateDockRunning();
    },

    /**
     * Được gọi khi cửa sổ bị đóng
     */
    onWindowClose(appId) {
        if (this.running[appId]) {
            const app = this.running[appId];
            SystemServices.freeRam(app.ramUsage || 50);

            const module = this.registry[appId];
            if (module && module.close) {
                module.close();
            }

            delete this.running[appId];
            Desktop.updateDockRunning();
        }
    },

    /**
     * Tick - cập nhật tất cả app đang chạy
     */
    tick() {
        Object.values(this.running).forEach(app => {
            const module = this.registry[app.id];
            if (module && module.tick) {
                module.tick();
            }
        });
    },

    /**
     * Thêm/trừ tiền
     */
    addMoney(amount) {
        this.money += amount;
    },

    canAfford(amount) {
        return this.money >= amount;
    },

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        return false;
    },

    /**
     * Serialize để lưu
     */
    serialize() {
        return {
            installed: Array.from(this.installed),
            money: this.money
        };
    },

    /**
     * Deserialize từ save
     */
    deserialize(data) {
        if (data.installed) {
            this.installed = new Set(data.installed);
        }
        if (data.money !== undefined) {
            this.money = data.money;
        }
    }
};
