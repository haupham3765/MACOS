/* ============================================
   calculator.js - Calculator App
   Máy tính cơ bản
   ============================================ */

const CalculatorApp = {
    winId: null,
    display: '0',
    prevValue: null,
    operator: null,
    waitingForOperand: false,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('calculator', 'Calculator', html, {
            width: 280, height: 400
        });
        this.bindEvents();
        return { id: 'calculator', winId: this.winId, ramUsage: 15 };
    },

    buildHTML() {
        return `
            <div style="display:flex;flex-direction:column;height:100%">
                <div class="calc-display" id="calc-display">${this.display}</div>
                <div class="calc-grid" style="flex:1">
                    <button class="calc-btn func" data-calc="clear">AC</button>
                    <button class="calc-btn func" data-calc="negate">±</button>
                    <button class="calc-btn func" data-calc="percent">%</button>
                    <button class="calc-btn operator" data-calc="÷">÷</button>

                    <button class="calc-btn" data-calc="7">7</button>
                    <button class="calc-btn" data-calc="8">8</button>
                    <button class="calc-btn" data-calc="9">9</button>
                    <button class="calc-btn operator" data-calc="×">×</button>

                    <button class="calc-btn" data-calc="4">4</button>
                    <button class="calc-btn" data-calc="5">5</button>
                    <button class="calc-btn" data-calc="6">6</button>
                    <button class="calc-btn operator" data-calc="-">−</button>

                    <button class="calc-btn" data-calc="1">1</button>
                    <button class="calc-btn" data-calc="2">2</button>
                    <button class="calc-btn" data-calc="3">3</button>
                    <button class="calc-btn operator" data-calc="+">+</button>

                    <button class="calc-btn" data-calc="0" style="grid-column:span 2">0</button>
                    <button class="calc-btn" data-calc=".">.</button>
                    <button class="calc-btn operator" data-calc="=">=</button>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        body.querySelectorAll('[data-calc]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleInput(btn.dataset.calc);
            });
        });
    },

    handleInput(val) {
        if (val === 'clear') {
            this.display = '0';
            this.prevValue = null;
            this.operator = null;
            this.waitingForOperand = false;
        } else if (val === 'negate') {
            const num = parseFloat(this.display);
            this.display = String(-num);
        } else if (val === 'percent') {
            const num = parseFloat(this.display);
            this.display = String(num / 100);
        } else if (['+', '-', '×', '÷'].includes(val)) {
            this.prevValue = parseFloat(this.display);
            this.operator = val;
            this.waitingForOperand = true;
        } else if (val === '=') {
            if (this.operator && this.prevValue !== null) {
                const current = parseFloat(this.display);
                let result = 0;
                switch (this.operator) {
                    case '+': result = this.prevValue + current; break;
                    case '-': result = this.prevValue - current; break;
                    case '×': result = this.prevValue * current; break;
                    case '÷': result = current !== 0 ? this.prevValue / current : 'Error'; break;
                }
                this.display = String(result);
                this.operator = null;
                this.prevValue = null;
                this.waitingForOperand = false;
            }
        } else {
            // Number or dot
            if (this.waitingForOperand) {
                this.display = val === '.' ? '0.' : val;
                this.waitingForOperand = false;
            } else {
                if (val === '.' && this.display.includes('.')) return;
                this.display = this.display === '0' && val !== '.' ? val : this.display + val;
            }
        }

        // Update display
        const displayEl = document.getElementById('calc-display');
        if (displayEl) displayEl.textContent = this.display;
    },

    close() { this.winId = null; },
    tick() {}
};

AppManager.register('calculator', CalculatorApp);
