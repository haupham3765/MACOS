/* ============================================
   ebook-reader.js - App Đọc Sách
   Đọc từ JSON, lật trang, import
   ============================================ */

const EbookReaderApp = {
    winId: null,
    currentBook: 0,
    currentPage: 0,
    customBooks: [],

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('ebook-reader', 'iBooks', html, {
            width: '62%', height: '80%'
        });
        this.bindEvents();
        return { id: 'ebook-reader', winId: this.winId, ramUsage: 40 };
    },

    getAllBooks() {
        return [...DATA.books, ...this.customBooks];
    },

    buildHTML() {
        const books = this.getAllBooks();
        const book = books[this.currentBook];

        if (!book) {
            return this.buildLibraryHTML();
        }

        const page = book.pages[this.currentPage] || 'Trang trống';
        const totalPages = book.pages.length;

        return `
            <div class="sidebar-layout">
                <div class="sidebar">
                    <div class="sidebar-section-title">Thư viện</div>
                    ${books.map((b, i) => `
                        <div class="sidebar-item ${i === this.currentBook ? 'active' : ''}" data-book-idx="${i}">
                            📖 ${b.title}
                        </div>
                    `).join('')}
                    <div class="sidebar-section-title" style="margin-top:12px">Tùy chọn</div>
                    <div class="sidebar-item" id="ebook-import">📂 Import JSON...</div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column">
                    <div style="padding:12px 16px;background:rgba(0,0,0,0.1);border-bottom:1px solid rgba(255,255,255,0.06)">
                        <div style="font-size:16px;font-weight:500;color:#fff">${book.title}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.4)">${book.author}</div>
                    </div>
                    <div class="ebook-page" style="flex:1;overflow-y:auto">${page}</div>
                    <div class="ebook-nav">
                        <button class="glass-btn" id="ebook-prev" ${this.currentPage === 0 ? 'disabled' : ''}>← Trước</button>
                        <span class="ebook-page-num">Trang ${this.currentPage + 1} / ${totalPages}</span>
                        <button class="glass-btn" id="ebook-next" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''}>Sau →</button>
                    </div>
                </div>
            </div>
        `;
    },

    buildLibraryHTML() {
        return `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column">
                <div style="font-size:64px;margin-bottom:16px">📚</div>
                <div style="font-size:16px;color:rgba(255,255,255,0.7)">Thư viện trống</div>
                <button class="glass-btn primary" id="ebook-import" style="margin-top:16px">Import sách (JSON)</button>
            </div>
        `;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Navigation
        const prevBtn = body.querySelector('#ebook-prev');
        const nextBtn = body.querySelector('#ebook-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.refresh();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const books = this.getAllBooks();
                const book = books[this.currentBook];
                if (book && this.currentPage < book.pages.length - 1) {
                    this.currentPage++;
                    this.refresh();
                }
            });
        }

        // Book selection
        body.querySelectorAll('[data-book-idx]').forEach(item => {
            item.addEventListener('click', () => {
                this.currentBook = parseInt(item.dataset.bookIdx);
                this.currentPage = 0;
                this.refresh();
            });
        });

        // Import
        const importBtn = body.querySelector('#ebook-import');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importJSON());
        }
    },

    importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (Array.isArray(data)) {
                        this.customBooks.push(...data);
                    } else if (data.title && data.pages) {
                        this.customBooks.push(data);
                    }
                    Desktop.notify('iBooks', 'Import sách thành công!');
                    this.refresh();
                } catch (err) {
                    Desktop.notify('iBooks', 'File JSON không hợp lệ!');
                }
            };
            reader.readAsText(file);
        });
        input.click();
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

AppManager.register('ebook-reader', EbookReaderApp);
