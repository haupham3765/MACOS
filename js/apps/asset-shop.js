/* ============================================
   asset-shop.js - Trading Hub
   Mua bán tài sản: crypto, vàng, đất, xe
   Giá thay đổi realtime
   ============================================ */

const AssetShopApp = {
    winId: null,
    currentTab: 'crypto',
    // Giá hiện tại (khởi tạo từ basePrice)
    prices: {},
    // Tài sản sở hữu: { assetId: quantity }
    owned: {},
    // Lịch sử giá (giữ tối đa 20 điểm)
    priceHistory: {},
    tickCount: 0,

    init() {
        // Khởi tạo giá từ dữ liệu
        Object.entries(DATA.assets).forEach(([category, items]) => {
            items.forEach(item => {
                this.prices[item.id] = item.basePrice;
                this.priceHistory[item.id] = [item.basePrice];
            });
        });
    },

    open() {
        if (!this.prices.btc) this.init();

        const html = this.buildHTML();
        this.winId = WindowManager.create('asset-shop', 'Trading Hub', html, {
            width: 650, height: 520
        });
        this.bindEvents();
        return { id: 'asset-shop', winId: this.winId, ramUsage: 65 };
    },

    buildHTML() {
        const tabs = [
            { id: 'crypto', label: '₿ Crypto' },
            { id: 'gold', label: '🥇 Vàng' },
            { id: 'realestate', label: '🏗️ Bất động sản' },
            { id: 'vehicles', label: '🚗 Xe cộ' }
        ];

        let html = `
            <div class="tab-bar">
                ${tabs.map(t => `<div class="tab-item ${t.id === this.currentTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</div>`).join('')}
            </div>
            <div style="padding:8px 12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 12px">
                    <span style="font-size:13px;color:rgba(255,255,255,0.5)">Số dư:</span>
                    <span style="font-size:18px;color:#FFD700;font-weight:600">${Utils.formatMoney(AppManager.money)}</span>
                </div>
                <div class="asset-list">
        `;

        const items = DATA.assets[this.currentTab] || [];
        items.forEach(item => {
            const price = this.prices[item.id] || item.basePrice;
            const prevPrice = this.getPrevPrice(item.id);
            const change = price - prevPrice;
            const changePct = prevPrice > 0 ? (change / prevPrice * 100) : 0;
            const isUp = change >= 0;
            const qty = this.owned[item.id] || 0;
            const totalValue = qty * price;

            html += `
                <div class="asset-item">
                    <div style="font-size:28px;margin-right:12px">${item.icon}</div>
                    <div class="asset-info">
                        <div class="asset-name">${item.name}</div>
                        <div class="asset-price ${isUp ? 'up' : 'down'}">
                            ${Utils.formatMoney(price)}
                            <span style="font-size:11px">${isUp ? '▲' : '▼'} ${Math.abs(changePct).toFixed(2)}%</span>
                        </div>
                        ${qty > 0 ? `<div class="asset-owned">Sở hữu: ${qty} (${Utils.formatMoney(totalValue)})</div>` : ''}
                    </div>
                    <div class="asset-actions">
                        <button class="glass-btn success" data-asset-action="buy" data-asset-id="${item.id}" ${!AppManager.canAfford(price) ? 'disabled' : ''}>
                            Mua
                        </button>
                        <button class="glass-btn danger" data-asset-action="sell" data-asset-id="${item.id}" ${qty <= 0 ? 'disabled' : ''}>
                            Bán
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        return html;
    },

    getPrevPrice(id) {
        const history = this.priceHistory[id];
        if (!history || history.length < 2) return this.prices[id] || 0;
        return history[history.length - 2];
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Tabs
        body.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });

        // Buy/Sell
        body.querySelectorAll('[data-asset-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.assetAction;
                const assetId = btn.dataset.assetId;
                if (action === 'buy') this.buy(assetId);
                else if (action === 'sell') this.sell(assetId);
            });
        });
    },

    buy(assetId) {
        const price = this.prices[assetId];
        if (!price || !AppManager.canAfford(price)) {
            Desktop.notify('Trading Hub', 'Không đủ tiền!');
            return;
        }
        AppManager.spendMoney(price);
        this.owned[assetId] = (this.owned[assetId] || 0) + 1;
        Desktop.notify('Trading Hub', `Đã mua thành công!`);
        this.refresh();
    },

    sell(assetId) {
        if (!this.owned[assetId] || this.owned[assetId] <= 0) return;
        const price = this.prices[assetId];
        AppManager.addMoney(price);
        this.owned[assetId]--;
        if (this.owned[assetId] <= 0) delete this.owned[assetId];
        Desktop.notify('Trading Hub', `Đã bán thành công! +${Utils.formatMoney(price)}`);
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
        this.tickCount++;
        // Cập nhật giá mỗi 3 tick (3 giây)
        if (this.tickCount % 3 !== 0) return;

        let changed = false;
        Object.entries(DATA.assets).forEach(([category, items]) => {
            items.forEach(item => {
                const currentPrice = this.prices[item.id] || item.basePrice;
                const change = currentPrice * item.volatility * Utils.rand(-1, 1);
                const newPrice = Math.max(currentPrice * 0.1, currentPrice + change); // Không giảm quá 90%
                this.prices[item.id] = newPrice;

                // Lưu lịch sử
                if (!this.priceHistory[item.id]) this.priceHistory[item.id] = [];
                this.priceHistory[item.id].push(newPrice);
                if (this.priceHistory[item.id].length > 20) {
                    this.priceHistory[item.id].shift();
                }
                changed = true;
            });
        });

        if (changed && this.winId) this.refresh();
    },

    serialize() {
        return {
            prices: { ...this.prices },
            owned: { ...this.owned }
        };
    },

    deserialize(data) {
        if (data.prices) this.prices = { ...data.prices };
        if (data.owned) this.owned = { ...data.owned };
    }
};

AppManager.register('asset-shop', AssetShopApp);
