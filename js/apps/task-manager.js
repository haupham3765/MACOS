/* ============================================
   task-manager.js - Task Manager
   Hiển thị CPU, RAM, Disk, App đang chạy
   ============================================ */

const TaskManagerApp = {
    winId: null,
    updateInterval: null,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('task-manager', 'Task Manager', html, {
            width: 600, height: 500
        });
        // Cập nhật mỗi giây
        this.updateInterval = setInterval(() => this.update(), 1000);
        return { id: 'task-manager', winId: this.winId, ramUsage: 45 };
    },

    buildHTML() {
        const cpu = SystemServices.getHardware('cpu');
        const ram = SystemServices.getHardware('ram');
        const disk = SystemServices.getHardware('disk');
        const gpu = SystemServices.getHardware('gpu');
        const stats = SystemServices.stats;

        const ramPct = (stats.ramUsed / stats.ramTotal * 100) || 0;
        const diskPct = (stats.diskUsed / stats.diskTotal * 100) || 0;

        let cpuColor = stats.cpuTotal > 80 ? '#FF3B30' : stats.cpuTotal > 50 ? '#FF9500' : '#34C759';
        let ramColor = ramPct > 80 ? '#FF3B30' : ramPct > 50 ? '#FF9500' : '#34C759';

        let html = `
            <div class="tm-grid">
                <div class="tm-card">
                    <div class="tm-card-title">CPU - ${cpu.name}</div>
                    <div class="tm-card-value" style="color:${cpuColor}">${stats.cpuTotal.toFixed(1)}%</div>
                    <div class="tm-core-bars">
        `;

        // Core bars
        for (let i = 0; i < cpu.cores; i++) {
            const usage = stats.cpuUsage[i] || 0;
            const color = usage > 80 ? '#FF3B30' : usage > 50 ? '#FF9500' : '#34C759';
            html += `
                <div class="tm-core-bar">
                    <span class="tm-core-bar-label">Core ${i}</span>
                    <div class="tm-core-bar-track">
                        <div class="tm-core-bar-fill" style="width:${usage}%;background:${color}"></div>
                    </div>
                    <span>${usage.toFixed(0)}%</span>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                <div class="tm-card">
                    <div class="tm-card-title">RAM - ${ram.name}</div>
                    <div class="tm-card-value" style="color:${ramColor}">${ramPct.toFixed(1)}%</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:8px">
                        ${Utils.formatSize(stats.ramUsed)} / ${Utils.formatSize(stats.ramTotal)}
                    </div>
                    <div class="progress-bar" style="height:8px">
                        <div class="progress-fill ${ramPct > 80 ? 'danger' : ramPct > 50 ? 'warning' : 'success'}" style="width:${ramPct}%"></div>
                    </div>
                </div>
                <div class="tm-card">
                    <div class="tm-card-title">Disk - ${disk.name}</div>
                    <div class="tm-card-value">${diskPct.toFixed(1)}%</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px">
                        ${Utils.formatSize(stats.diskUsed)} / ${Utils.formatSize(stats.diskTotal)}
                    </div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4)">
                        Read: ${stats.diskRead.toFixed(1)} MB/s | Write: ${stats.diskWrite.toFixed(1)} MB/s
                    </div>
                    <div class="progress-bar" style="height:8px;margin-top:6px">
                        <div class="progress-fill" style="width:${diskPct}%"></div>
                    </div>
                </div>
                <div class="tm-card">
                    <div class="tm-card-title">GPU - ${gpu.name}</div>
                    <div class="tm-card-value">${stats.gpuUsage.toFixed(1)}%</div>
                    <div class="progress-bar" style="height:8px">
                        <div class="progress-fill" style="width:${stats.gpuUsage}%;background:#AF52DE"></div>
                    </div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px">
                        Network: ↓${Utils.formatSpeed(stats.netDownload / 8)} ↑${Utils.formatSpeed(stats.netUpload / 8)}
                    </div>
                </div>
            </div>

            <div class="tm-process-list">
                <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:8px;font-weight:600">
                    TIẾN TRÌNH ĐANG CHẠY
                </div>
                <div class="tm-process-header">
                    <span>Tên</span>
                    <span>CPU</span>
                    <span>RAM</span>
                    <span>Trạng thái</span>
                </div>
        `;

        // System process
        html += `
            <div class="tm-process-row">
                <span>⚙️ System</span>
                <span>5%</span>
                <span>${Utils.formatSize(stats.ramTotal * 0.1)}</span>
                <span style="color:#34C759">Running</span>
            </div>
            <div class="tm-process-row">
                <span>🖥️ WindowServer</span>
                <span>3%</span>
                <span>${Utils.formatSize(stats.ramTotal * 0.05)}</span>
                <span style="color:#34C759">Running</span>
            </div>
            <div class="tm-process-row">
                <span>📁 Finder</span>
                <span>1%</span>
                <span>${Utils.formatSize(stats.ramTotal * 0.02)}</span>
                <span style="color:#34C759">Running</span>
            </div>
        `;

        // App processes
        const runningApps = AppManager.getRunningApps();
        runningApps.forEach(app => {
            const def = DATA.appDefs[app.id];
            if (!def) return;
            const cpuUse = (8 + Utils.rand(-2, 2)).toFixed(1);
            html += `
                <div class="tm-process-row">
                    <span>${def.icon} ${def.name}</span>
                    <span>${cpuUse}%</span>
                    <span>${Utils.formatSize(app.ramUsage || 50)}</span>
                    <span style="color:#34C759">Running</span>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    update() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
    },

    close() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.winId = null;
    },

    tick() {}
};

AppManager.register('task-manager', TaskManagerApp);
