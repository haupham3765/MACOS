/* ============================================
   system-services.js - Giả lập phần cứng
   CPU, RAM, Disk, GPU, Network
   Hiệu năng thay đổi theo linh kiện
   ============================================ */

const SystemServices = {
    // Cấu hình phần cứng hiện tại (ID)
    hardware: {
        cpu: 'pentium',
        ram: 'ram4',
        disk: 'hdd500',
        gpu: 'igpu',
        network: 'net10'
    },

    // Trạng thái realtime
    stats: {
        cpuUsage: [],      // mảng usage từng core (%)
        cpuTotal: 0,       // tổng CPU %
        ramUsed: 0,        // MB đã dùng
        ramTotal: 0,       // MB tổng
        diskUsed: 0,       // MB đã dùng
        diskTotal: 0,      // MB tổng
        diskRead: 0,       // MB/s hiện tại
        diskWrite: 0,      // MB/s hiện tại
        gpuUsage: 0,       // %
        netSpeed: 0,       // Mbps hiện tại
        netTotal: 0,       // Mbps tổng
        netUpload: 0,      // Mbps upload
        netDownload: 0     // Mbps download
    },

    // Performance multiplier (ảnh hưởng bởi phần cứng)
    perfMultiplier: 1.0,

    /**
     * Khởi tạo hệ thống phần cứng
     */
    init() {
        this.recalculate();
    },

    /**
     * Lấy thông tin linh kiện hiện tại
     */
    getHardware(type) {
        const list = DATA.hardware[type];
        return list.find(h => h.id === this.hardware[type]) || list[0];
    },

    /**
     * Nâng cấp linh kiện
     */
    upgrade(type, id) {
        const item = DATA.hardware[type].find(h => h.id === id);
        if (!item) return false;
        this.hardware[type] = id;
        this.recalculate();
        return true;
    },

    /**
     * Tính toán lại dựa trên linh kiện
     */
    recalculate() {
        const cpu = this.getHardware('cpu');
        const ram = this.getHardware('ram');
        const disk = this.getHardware('disk');
        const gpu = this.getHardware('gpu');
        const net = this.getHardware('network');

        // Khởi tạo usage cho từng core
        this.stats.cpuUsage = new Array(cpu.cores).fill(0);
        this.stats.ramTotal = ram.total;
        this.stats.diskTotal = disk.total;
        this.stats.netTotal = net.speed;

        // Base RAM usage (hệ thống dùng ~20% RAM)
        this.stats.ramUsed = Math.floor(ram.total * 0.2);

        // Base disk usage
        this.stats.diskUsed = Math.floor(disk.total * 0.15);

        // Performance multiplier = trung bình cộng các yếu tố
        this.perfMultiplier = (cpu.speed + ram.speed + (disk.readSpeed / 1000) + gpu.power) / 4;
    },

    /**
     * Tick - Cập nhật trạng thái mỗi giây
     */
    tick() {
        const cpu = this.getHardware('cpu');
        const runningApps = AppManager.getRunningApps();
        const appCount = runningApps.length;

        // Tính CPU usage dựa trên số app đang chạy
        const baseLoad = 5; // baseline 5%
        const perAppLoad = 8; // mỗi app ~8%
        const totalLoad = Utils.clamp(baseLoad + appCount * perAppLoad, 0, 95);

        // Phân bố load cho từng core
        for (let i = 0; i < cpu.cores; i++) {
            const coreBase = totalLoad / cpu.cores;
            // Thêm biến động nhỏ cho mỗi core
            const variation = Utils.rand(-5, 5);
            this.stats.cpuUsage[i] = Utils.clamp(coreBase + variation, 0, 100);
        }

        // Tổng CPU
        this.stats.cpuTotal = this.stats.cpuUsage.reduce((a, b) => a + b, 0) / cpu.cores;

        // RAM: base + mỗi app dùng thêm
        const ram = this.getHardware('ram');
        const baseRam = ram.total * 0.2;
        let appRam = 0;
        runningApps.forEach(app => {
            appRam += (app.ramUsage || 50); // mỗi app ~50MB mặc định
        });
        this.stats.ramUsed = Math.min(baseRam + appRam, ram.total * 0.95);

        // GPU usage
        const gpu = this.getHardware('gpu');
        this.stats.gpuUsage = Utils.clamp(10 + appCount * 3 + Utils.rand(-2, 2), 0, 100);

        // Network: biến động nhỏ
        const net = this.getHardware('network');
        this.stats.netDownload = Utils.clamp(Utils.rand(0, net.speed * 0.1), 0, net.speed);
        this.stats.netUpload = Utils.clamp(Utils.rand(0, net.speed * 0.05), 0, net.speed);

        // Disk I/O: biến động nhỏ
        const disk = this.getHardware('disk');
        this.stats.diskRead = Utils.clamp(Utils.rand(0, disk.readSpeed * 0.05), 0, disk.readSpeed);
        this.stats.diskWrite = Utils.clamp(Utils.rand(0, disk.writeSpeed * 0.03), 0, disk.writeSpeed);

        // Hiệu năng: CPU yếu → lag (tick chậm hơn)
        this.updatePerfMultiplier();
    },

    /**
     * Cập nhật performance multiplier
     */
    updatePerfMultiplier() {
        const cpu = this.getHardware('cpu');
        const gpu = this.getHardware('gpu');
        this.perfMultiplier = Utils.clamp((cpu.speed + gpu.power) / 2, 0.5, 12);
    },

    /**
     * Thêm RAM usage (khi app mở)
     */
    addRamUsage(amount) {
        const ram = this.getHardware('ram');
        this.stats.ramUsed = Math.min(this.stats.ramUsed + amount, ram.total * 0.95);
    },

    /**
     * Giảm RAM usage (khi app đóng)
     */
    freeRam(amount) {
        this.stats.ramUsed = Math.max(this.stats.ramUsed - amount, this.getHardware('ram').total * 0.2);
    },

    /**
     * Thêm disk usage (khi cài app)
     */
    addDiskUsage(mb) {
        const disk = this.getHardware('disk');
        this.stats.diskUsed = Math.min(this.stats.diskUsed + mb, disk.total * 0.98);
    },

    /**
     * Giảm disk usage (khi gỡ app)
     */
    freeDisk(mb) {
        this.stats.diskUsed = Math.max(this.stats.diskUsed - mb, this.getHardware('disk').total * 0.1);
    },

    /**
     * Lấy tốc độ download hiệu quả (MB/s)
     */
    getEffectiveDownloadSpeed() {
        const net = this.getHardware('network');
        // Mbps -> MB/s (chia 8), có biến động
        return (net.speed / 8) * Utils.rand(0.6, 0.95);
    },

    /**
     * Lấy tốc độ upload hiệu quả (MB/s)
     */
    getEffectiveUploadSpeed() {
        const net = this.getHardware('network');
        return (net.speed / 16) * Utils.rand(0.5, 0.85);
    },

    /**
     * Serialize trạng thái để lưu
     */
    serialize() {
        return {
            hardware: { ...this.hardware },
            diskUsed: this.stats.diskUsed
        };
    },

    /**
     * Load trạng thái từ save
     */
    deserialize(data) {
        if (data.hardware) {
            this.hardware = { ...data.hardware };
        }
        this.recalculate();
        if (data.diskUsed !== undefined) {
            this.stats.diskUsed = data.diskUsed;
        }
    }
};
