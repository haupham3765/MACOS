/* ============================================
   window-manager.js - Quản lý cửa sổ
   Tạo, kéo, resize, minimize, maximize, close
   ============================================ */

const WindowManager = {
    windows: {},   // id -> window data
    zCounter: 100, // z-index counter
    activeId: null,
    dragState: null,
    resizeState: null,

    /**
     * Khởi tạo event listeners
     */
    init() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
    },

    /**
     * Tính kích thước cửa sổ theo tỷ lệ màn hình desktop
     * @param {number} widthPct - % chiều rộng (0-100) so với vùng desktop
     * @param {number} heightPct - % chiều cao (0-100) so với vùng desktop
     * @returns {{ w: number, h: number }}
     */
    calcSize(widthPct, heightPct) {
        const isMobile = window.innerWidth <= 480;
        const isTablet = !isMobile && window.innerWidth <= 768;
        const menuH = isMobile ? 24 : 28;
        const dockH = isMobile ? 58 : (isTablet ? 68 : 80);
        const desktopW = window.innerWidth;
        const desktopH = window.innerHeight - menuH - dockH;
        return {
            w: Math.round(desktopW * widthPct / 100),
            h: Math.round(desktopH * heightPct / 100)
        };
    },

    /**
     * Tạo cửa sổ mới
     * options.width / options.height có thể là:
     *   - string kết thúc '%' → tính theo tỷ lệ desktop (ví dụ '70%')
     *   - number → pixel cố định (fallback)
     */
    create(appId, title, contentHTML, options = {}) {
        const id = 'win-' + Utils.uid();
        const isMobile = window.innerWidth <= 480;
        const isTablet = !isMobile && window.innerWidth <= 768;

        // Lấy chiều cao thực tế của menubar và dock theo breakpoint
        const menuH = isMobile ? 24 : 28;
        const dockH = isMobile ? 58 : (isTablet ? 68 : 80);

        let w, h;
        if (isMobile) {
            // Mobile: chiếm toàn bộ màn hình (trừ menubar)
            w = window.innerWidth;
            h = window.innerHeight - menuH;
        } else {
            const desktopW = window.innerWidth;
            const desktopH = window.innerHeight - menuH - dockH; // trừ menu bar và dock

            // Parse width
            if (typeof options.width === 'string' && options.width.endsWith('%')) {
                w = Math.round(desktopW * parseFloat(options.width) / 100);
            } else {
                w = options.width || 700;
            }

            // Parse height
            if (typeof options.height === 'string' && options.height.endsWith('%')) {
                h = Math.round(desktopH * parseFloat(options.height) / 100);
            } else {
                h = options.height || 500;
            }

            // Đảm bảo không vượt quá vùng desktop
            w = Math.min(w, desktopW - 20);
            h = Math.min(h, desktopH - 10);
        }

        const x = isMobile ? 0 : (options.x ?? Utils.randInt(30, Math.max(40, window.innerWidth - w - 30)));
        const y = isMobile ? menuH : (options.y ?? Utils.randInt(menuH + 6, Math.max(menuH + 10, menuH + window.innerHeight - menuH - dockH - h)));

        const winEl = document.createElement('div');
        winEl.className = 'window active';
        winEl.id = id;
        winEl.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px;z-index:${++this.zCounter};animation:scaleIn 0.25s ease`;

        winEl.innerHTML = `
            <div class="window-titlebar" data-winid="${id}">
                <div class="window-controls">
                    <button class="window-btn close" data-action="close" data-winid="${id}"></button>
                    <button class="window-btn minimize" data-action="minimize" data-winid="${id}"></button>
                    <button class="window-btn maximize" data-action="maximize" data-winid="${id}"></button>
                </div>
                <span class="window-title">${title}</span>
            </div>
            <div class="window-body" id="${id}-body">${contentHTML}</div>
            <div class="window-resize" data-winid="${id}"></div>
        `;

        document.getElementById('windows-container').appendChild(winEl);

        // Lưu dữ liệu
        this.windows[id] = {
            id, appId, title, el: winEl,
            x, y, w, h,
            minimized: false, maximized: false,
            prevX: x, prevY: y, prevW: w, prevH: h
        };

        // Events
        this.bindWindowEvents(id);
        this.setActive(id);

        // Cập nhật menu bar tên app
        const appDef = DATA.appDefs[appId];
        if (appDef) {
            document.getElementById('menu-app-name').textContent = appDef.name;
        }

        return id;
    },

    /**
     * Bind events cho cửa sổ
     */
    bindWindowEvents(id) {
        const win = this.windows[id];
        const el = win.el;

        // Click để focus
        el.addEventListener('mousedown', () => this.setActive(id));
        el.addEventListener('touchstart', () => this.setActive(id));

        // Nút điều khiển
        el.querySelectorAll('.window-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'close') this.close(id);
                else if (action === 'minimize') this.minimize(id);
                else if (action === 'maximize') this.toggleMaximize(id);
            });
        });

        // Kéo titlebar
        const titlebar = el.querySelector('.window-titlebar');
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-btn')) return;
            this.startDrag(id, e.clientX, e.clientY);
        });
        titlebar.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('window-btn')) return;
            const t = e.touches[0];
            this.startDrag(id, t.clientX, t.clientY);
        });

        // Double-click titlebar → maximize
        titlebar.addEventListener('dblclick', () => this.toggleMaximize(id));

        // Resize handle
        const resizeHandle = el.querySelector('.window-resize');
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startResize(id, e.clientX, e.clientY);
        });
        resizeHandle.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const t = e.touches[0];
            this.startResize(id, t.clientX, t.clientY);
        });
    },

    /**
     * Đặt cửa sổ active
     */
    setActive(id) {
        if (this.activeId === id) return;

        // Bỏ active cũ
        Object.values(this.windows).forEach(w => w.el.classList.remove('active'));

        if (this.windows[id]) {
            this.windows[id].el.classList.add('active');
            this.windows[id].el.style.zIndex = ++this.zCounter;
            this.activeId = id;

            const appDef = DATA.appDefs[this.windows[id].appId];
            if (appDef) {
                document.getElementById('menu-app-name').textContent = appDef.name;
            }
        }
    },

    /**
     * Đóng cửa sổ
     */
    close(id) {
        const win = this.windows[id];
        if (!win) return;

        win.el.style.animation = 'none';
        win.el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        win.el.style.transform = 'scale(0.8)';
        win.el.style.opacity = '0';

        setTimeout(() => {
            win.el.remove();
            delete this.windows[id];

            // Thông báo AppManager
            AppManager.onWindowClose(win.appId);

            // Focus cửa sổ khác nếu có
            const remaining = Object.keys(this.windows);
            if (remaining.length > 0) {
                this.setActive(remaining[remaining.length - 1]);
            } else {
                this.activeId = null;
                document.getElementById('menu-app-name').textContent = 'Finder';
            }
        }, 200);
    },

    /**
     * Thu nhỏ cửa sổ
     */
    minimize(id) {
        const win = this.windows[id];
        if (!win) return;
        win.minimized = true;
        win.el.classList.add('minimized');

        const remaining = Object.values(this.windows).filter(w => !w.minimized);
        if (remaining.length > 0) {
            this.setActive(remaining[remaining.length - 1].id);
        } else {
            this.activeId = null;
            document.getElementById('menu-app-name').textContent = 'Finder';
        }
    },

    /**
     * Khôi phục từ minimize
     */
    restore(id) {
        const win = this.windows[id];
        if (!win) return;
        win.minimized = false;
        win.el.classList.remove('minimized');
        this.setActive(id);
    },

    /**
     * Toggle maximize
     */
    toggleMaximize(id) {
        const win = this.windows[id];
        if (!win) return;

        if (win.maximized) {
            win.maximized = false;
            win.el.classList.remove('maximized');
            win.el.style.left = win.prevX + 'px';
            win.el.style.top = win.prevY + 'px';
            win.el.style.width = win.prevW + 'px';
            win.el.style.height = win.prevH + 'px';
        } else {
            win.prevX = parseInt(win.el.style.left);
            win.prevY = parseInt(win.el.style.top);
            win.prevW = parseInt(win.el.style.width);
            win.prevH = parseInt(win.el.style.height);
            win.maximized = true;
            win.el.classList.add('maximized');
        }
    },

    /**
     * Bắt đầu kéo
     */
    startDrag(id, clientX, clientY) {
        const win = this.windows[id];
        if (!win || win.maximized) return;

        this.dragState = {
            id,
            startX: clientX,
            startY: clientY,
            origX: parseInt(win.el.style.left),
            origY: parseInt(win.el.style.top)
        };
    },

    /**
     * Bắt đầu resize
     */
    startResize(id, clientX, clientY) {
        const win = this.windows[id];
        if (!win || win.maximized) return;

        this.resizeState = {
            id,
            startX: clientX,
            startY: clientY,
            origW: parseInt(win.el.style.width),
            origH: parseInt(win.el.style.height)
        };
    },

    /**
     * Mouse/Touch move
     */
    onMouseMove(e) {
        if (this.dragState) {
            const dx = e.clientX - this.dragState.startX;
            const dy = e.clientY - this.dragState.startY;
            const win = this.windows[this.dragState.id];
            if (win) {
                win.el.style.left = (this.dragState.origX + dx) + 'px';
                const menuH = window.innerWidth <= 480 ? 24 : 28;
                win.el.style.top = Math.max(menuH, this.dragState.origY + dy) + 'px';
            }
        }
        if (this.resizeState) {
            const dx = e.clientX - this.resizeState.startX;
            const dy = e.clientY - this.resizeState.startY;
            const win = this.windows[this.resizeState.id];
            if (win) {
                win.el.style.width = Math.max(320, this.resizeState.origW + dx) + 'px';
                win.el.style.height = Math.max(200, this.resizeState.origH + dy) + 'px';
            }
        }
    },

    onTouchMove(e) {
        if (this.dragState || this.resizeState) {
            e.preventDefault();
            const t = e.touches[0];
            this.onMouseMove({ clientX: t.clientX, clientY: t.clientY });
        }
    },

    onMouseUp() {
        this.dragState = null;
        this.resizeState = null;
    },

    onTouchEnd() {
        this.dragState = null;
        this.resizeState = null;
    },

    /**
     * Đóng tất cả cửa sổ
     */
    closeAll() {
        Object.keys(this.windows).forEach(id => {
            this.windows[id].el.remove();
            delete this.windows[id];
        });
        this.activeId = null;
    },

    /**
     * Tìm cửa sổ theo appId
     */
    findByApp(appId) {
        return Object.values(this.windows).find(w => w.appId === appId);
    },

    /**
     * Focus hoặc restore cửa sổ của app
     */
    focusApp(appId) {
        const win = this.findByApp(appId);
        if (win) {
            if (win.minimized) this.restore(win.id);
            else this.setActive(win.id);
            return true;
        }
        return false;
    }
};
