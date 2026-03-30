/* ============================================
   hardware-shop.js - Shop Linh Kiện
   Mua và nâng cấp CPU, RAM, SSD, GPU, Network
   ============================================ */

const HardwareShopApp = {
    winId: null,
    currentTab: 'cpu',

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('hardware-shop', 'Hardware Shop', html, {
            width: '62%', height: '82%'
        });
        this.bindEvents();
        return { id: 'hardware-shop', winId: this.winId, ramUsage: 60 };
    },

    buildHTML() {
        const tabs = [
            { id: 'cpu', label: '🔲 CPU' },
            { id: 'ram', label: '💾 RAM' },
            { id: 'disk', label: '💽 Disk' },
            { id: 'gpu', label: '🎮 GPU' },
            { id: 'network', label: '📶 Network' }
        ];

        let html = `
            <div class="tab-bar">
                ${tabs.map(t => `<div class="tab-item ${t.id === this.currentTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</div>`).join('')}
            </div>
            <div style="padding:4px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0">
                    <span style="font-size:13px;color:rgba(255,255,255,0.5)">Số dư:</span>
                    <span style="font-size:18px;color:#FFD700;font-weight:600">${Utils.formatMoney(AppManager.money)}</span>
                </div>
        `;

        const items = DATA.hardware[this.currentTab];
        const currentId = SystemServices.hardware[this.currentTab];

        items.forEach(item => {
            const isCurrent = item.id === currentId;
            const canBuy = !isCurrent && AppManager.canAfford(item.price) && item.price > 0;
            const isOwned = item.price === 0 && isCurrent;

            let specs = '';
            if (this.currentTab === 'cpu') specs = `${item.cores} cores / ${item.threads} threads / Speed: ${item.speed}x`;
            else if (this.currentTab === 'ram') specs = `${Utils.formatSize(item.total)} / Speed: ${item.speed}x`;
            else if (this.currentTab === 'disk') specs = `${Utils.formatSize(item.total)} / Read: ${item.readSpeed} MB/s / Write: ${item.writeSpeed} MB/s`;
            else if (this.currentTab === 'gpu') specs = `Power: ${item.power}x`;
            else if (this.currentTab === 'network') specs = `Speed: ${item.speed} Mbps`;

            html += `
                <div class="shop-item ${isCurrent ? 'current' : ''}">
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.icon} ${item.name}</div>
                        <div class="shop-item-specs">${specs}</div>
                    </div>
                    <div class="shop-item-price">${item.price === 0 ? 'Mặc định' : Utils.formatMoney(item.price)}</div>
                    <button class="glass-btn ${isCurrent ? 'primary' : canBuy ? 'success' : ''}"
                            data-hw-id="${item.id}" data-hw-type="${this.currentTab}"
                            ${isCurrent || !canBuy ? 'disabled' : ''}>
                        ${isCurrent ? '✓ Đang dùng' : canBuy ? 'Mua' : item.price === 0 ? 'Chọn' : 'Không đủ tiền'}
                    </button>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Tabs
        body.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });

        // Buy buttons
        body.querySelectorAll('.glass-btn[data-hw-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const hwId = btn.dataset.hwId;
                const hwType = btn.dataset.hwType;
                this.buyHardware(hwType, hwId);
            });
        });
    },

    buyHardware(type, id) {
        const item = DATA.hardware[type].find(h => h.id === id);
        if (!item) return;

        if (item.price > 0) {
            if (!AppManager.spendMoney(item.price)) {
                Desktop.notify('Hardware Shop', 'Không đủ tiền!');
                return;
            }
        }

        SystemServices.upgrade(type, id);
        Desktop.notify('Hardware Shop', `Đã nâng cấp lên ${item.name}!`);
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
    tick() {}
};

AppManager.register('hardware-shop', HardwareShopApp);
