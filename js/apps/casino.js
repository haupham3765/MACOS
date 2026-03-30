/* ============================================
   casino.js - Casino Royale
   Bầu cua, quay số (slot machine)
   Hệ thống tiền chung AppManager.money
   ============================================ */

const CasinoApp = {
    winId: null,
    currentGame: 'baucua',

    // Bầu cua state
    bauCuaBets: {},      // { symbolId: amount }
    bauCuaResults: [],
    bauCuaRolling: false,
    bauCuaRollInterval: null,

    // Slot machine state
    slotReels: ['🍒', '🍒', '🍒'],
    slotBet: 100,
    slotSpinning: false,
    slotIntervals: [],

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('casino', 'Casino Royale', html, {
            width: '52%', height: '85%'
        });
        this.bindEvents();
        return { id: 'casino', winId: this.winId, ramUsage: 55 };
    },

    buildHTML() {
        if (this.currentGame === 'baucua') return this.buildBauCuaHTML();
        if (this.currentGame === 'slot') return this.buildSlotHTML();
        return '';
    },

    buildBauCuaHTML() {
        const totalBet = Object.values(this.bauCuaBets).reduce((a, b) => a + b, 0);

        let html = `
            <div class="casino-container">
                <div class="tab-bar" style="margin:-16px -16px 16px -16px">
                    <div class="tab-item active" data-game="baucua">🎲 Bầu Cua</div>
                    <div class="tab-item" data-game="slot">🎰 Slot Machine</div>
                </div>
                <div class="casino-balance">💰 ${Utils.formatMoney(AppManager.money)}</div>

                <div class="casino-game-area">
                    <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:12px">Kết quả xúc xắc:</div>
                    <div class="baucua-dice-area">
        `;

        // 3 dice
        for (let i = 0; i < 3; i++) {
            const result = this.bauCuaResults[i];
            const emoji = result ? DATA.bauCua.find(b => b.id === result)?.emoji || '❓' : '❓';
            html += `<div class="baucua-dice ${this.bauCuaRolling ? 'rolling' : ''}">${emoji}</div>`;
        }

        html += `
                    </div>
                </div>

                <div style="font-size:13px;color:rgba(255,255,255,0.5);margin:12px 0">
                    Đặt cược (nhấn để tăng $100, giữ Shift để tăng $500):
                </div>
                <div class="baucua-bet-area">
        `;

        DATA.bauCua.forEach(item => {
            const bet = this.bauCuaBets[item.id] || 0;
            html += `
                <div class="baucua-bet-item ${bet > 0 ? 'selected' : ''}" data-bc-id="${item.id}">
                    <span class="emoji">${item.emoji}</span>
                    <span class="label">${item.name}</span>
                    <span class="bet-amount">${bet > 0 ? Utils.formatMoney(bet) : '---'}</span>
                </div>
            `;
        });

        html += `
                </div>
                <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
                    <button class="glass-btn" id="bc-clear">Xóa cược</button>
                    <button class="glass-btn primary" id="bc-roll" ${totalBet === 0 || this.bauCuaRolling ? 'disabled' : ''}>
                        🎲 Lắc! (${Utils.formatMoney(totalBet)})
                    </button>
                </div>
            </div>
        `;
        return html;
    },

    buildSlotHTML() {
        let html = `
            <div class="casino-container">
                <div class="tab-bar" style="margin:-16px -16px 16px -16px">
                    <div class="tab-item" data-game="baucua">🎲 Bầu Cua</div>
                    <div class="tab-item active" data-game="slot">🎰 Slot Machine</div>
                </div>
                <div class="casino-balance">💰 ${Utils.formatMoney(AppManager.money)}</div>

                <div class="casino-game-area">
                    <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:12px">🎰 JACKPOT</div>
                    <div class="slot-reels">
                        <div class="slot-reel ${this.slotSpinning ? 'spinning' : ''}">${this.slotReels[0]}</div>
                        <div class="slot-reel ${this.slotSpinning ? 'spinning' : ''}">${this.slotReels[1]}</div>
                        <div class="slot-reel ${this.slotSpinning ? 'spinning' : ''}">${this.slotReels[2]}</div>
                    </div>
                    <div style="margin-top:16px">
                        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:8px">Cược mỗi lần:</div>
                        <div style="display:flex;gap:8px;justify-content:center">
                            <button class="glass-btn ${this.slotBet === 50 ? 'primary' : ''}" data-slot-bet="50">$50</button>
                            <button class="glass-btn ${this.slotBet === 100 ? 'primary' : ''}" data-slot-bet="100">$100</button>
                            <button class="glass-btn ${this.slotBet === 500 ? 'primary' : ''}" data-slot-bet="500">$500</button>
                            <button class="glass-btn ${this.slotBet === 1000 ? 'primary' : ''}" data-slot-bet="1000">$1K</button>
                        </div>
                    </div>
                </div>

                <div style="margin-top:16px;text-align:center">
                    <button class="glass-btn primary" id="slot-spin" style="padding:12px 40px;font-size:16px" ${this.slotSpinning ? 'disabled' : ''}>
                        🎰 QUAY! (${Utils.formatMoney(this.slotBet)})
                    </button>
                </div>

                <div style="margin-top:16px;font-size:11px;color:rgba(255,255,255,0.3);text-align:left">
                    <div>💎💎💎 = x20 | 7️⃣7️⃣7️⃣ = x10 | ⭐⭐⭐ = x5</div>
                    <div>3 giống = x3 | 2 giống = x1.5</div>
                </div>
            </div>
        `;
        return html;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Game tabs
        body.querySelectorAll('.tab-item[data-game]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentGame = tab.dataset.game;
                this.refresh();
            });
        });

        if (this.currentGame === 'baucua') this.bindBauCuaEvents(body);
        if (this.currentGame === 'slot') this.bindSlotEvents(body);
    },

    bindBauCuaEvents(body) {
        // Bet items
        body.querySelectorAll('.baucua-bet-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.bcId;
                const amount = e.shiftKey ? 500 : 100;
                if (!AppManager.canAfford(amount)) {
                    Desktop.notify('Casino', 'Không đủ tiền!');
                    return;
                }
                this.bauCuaBets[id] = (this.bauCuaBets[id] || 0) + amount;
                this.refresh();
            });
        });

        // Clear bet
        const clearBtn = body.querySelector('#bc-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.bauCuaBets = {};
                this.refresh();
            });
        }

        // Roll
        const rollBtn = body.querySelector('#bc-roll');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollBauCua());
        }
    },

    rollBauCua() {
        if (this.bauCuaRolling) return;
        const totalBet = Object.values(this.bauCuaBets).reduce((a, b) => a + b, 0);
        if (totalBet === 0) return;

        // Trừ tiền cược
        AppManager.spendMoney(totalBet);
        this.bauCuaRolling = true;
        this.refresh();

        // Animation lắc
        let rollCount = 0;
        this.bauCuaRollInterval = setInterval(() => {
            this.bauCuaResults = [
                Utils.pick(DATA.bauCua).id,
                Utils.pick(DATA.bauCua).id,
                Utils.pick(DATA.bauCua).id
            ];
            rollCount++;
            this.refresh();

            if (rollCount >= 15) {
                clearInterval(this.bauCuaRollInterval);
                this.bauCuaRolling = false;

                // Tính thưởng
                let winnings = 0;
                Object.entries(this.bauCuaBets).forEach(([symbolId, betAmount]) => {
                    const count = this.bauCuaResults.filter(r => r === symbolId).length;
                    if (count > 0) {
                        winnings += betAmount * count; // Thắng x1 cho mỗi lần xuất hiện
                    }
                });

                if (winnings > 0) {
                    AppManager.addMoney(winnings);
                    Desktop.notify('Casino', `🎉 Thắng ${Utils.formatMoney(winnings)}!`);
                } else {
                    Desktop.notify('Casino', `😢 Thua ${Utils.formatMoney(totalBet)}!`);
                }

                this.bauCuaBets = {};
                this.refresh();
            }
        }, 100);
    },

    bindSlotEvents(body) {
        // Bet amount
        body.querySelectorAll('[data-slot-bet]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.slotBet = parseInt(btn.dataset.slotBet);
                this.refresh();
            });
        });

        // Spin
        const spinBtn = body.querySelector('#slot-spin');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spinSlot());
        }
    },

    spinSlot() {
        if (this.slotSpinning) return;
        if (!AppManager.canAfford(this.slotBet)) {
            Desktop.notify('Casino', 'Không đủ tiền!');
            return;
        }

        AppManager.spendMoney(this.slotBet);
        this.slotSpinning = true;
        this.refresh();

        // Animation quay
        const symbols = DATA.slotSymbols;
        let spins = [0, 0, 0];
        const stopAt = [
            Utils.randInt(10, 15),
            Utils.randInt(15, 20),
            Utils.randInt(20, 25)
        ];

        const spinInterval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                if (spins[i] < stopAt[i]) {
                    this.slotReels[i] = Utils.pick(symbols);
                    spins[i]++;
                }
            }
            this.refresh();

            if (spins[0] >= stopAt[0] && spins[1] >= stopAt[1] && spins[2] >= stopAt[2]) {
                clearInterval(spinInterval);
                this.slotSpinning = false;

                // Tính thưởng
                let multiplier = 0;
                const [a, b, c] = this.slotReels;

                if (a === b && b === c) {
                    // 3 giống nhau
                    if (a === '💎') multiplier = 20;
                    else if (a === '7️⃣') multiplier = 10;
                    else if (a === '⭐') multiplier = 5;
                    else multiplier = 3;
                } else if (a === b || b === c || a === c) {
                    multiplier = 1.5;
                }

                if (multiplier > 0) {
                    const winnings = Math.floor(this.slotBet * multiplier);
                    AppManager.addMoney(winnings);
                    Desktop.notify('Casino', `🎰 Thắng ${Utils.formatMoney(winnings)}! (x${multiplier})`);
                } else {
                    Desktop.notify('Casino', `😢 Thua ${Utils.formatMoney(this.slotBet)}!`);
                }

                this.refresh();
            }
        }, 80);
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() {
        if (this.bauCuaRollInterval) clearInterval(this.bauCuaRollInterval);
        this.slotIntervals.forEach(i => clearInterval(i));
        this.winId = null;
    },

    tick() {},

    serialize() {
        return {};
    },

    deserialize(data) {}
};

AppManager.register('casino', CasinoApp);
