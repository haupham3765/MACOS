/* ============================================
   notes.js - Notes App
   Ghi chú đơn giản
   ============================================ */

const NotesApp = {
    winId: null,
    notes: [
        { id: 'n1', title: 'Ghi chú đầu tiên', content: 'Chào mừng đến macOS Liquid Glass!\n\nĐây là ứng dụng ghi chú. Bạn có thể tạo, sửa và xóa ghi chú.' },
        { id: 'n2', title: 'Hướng dẫn sử dụng', content: '- Mở App Store để cài thêm ứng dụng\n- Mở Hardware Shop để nâng cấp linh kiện\n- Mở Settings để lưu/tải game\n- Mở Task Manager để xem hiệu năng' }
    ],
    currentNote: 0,

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('notes', 'Notes', html, {
            width: '55%', height: '68%'
        });
        this.bindEvents();
        return { id: 'notes', winId: this.winId, ramUsage: 25 };
    },

    buildHTML() {
        const note = this.notes[this.currentNote];

        return `
            <div class="sidebar-layout">
                <div class="sidebar">
                    <div style="padding:8px">
                        <button class="glass-btn primary" id="notes-new" style="width:100%;font-size:12px">+ Ghi chú mới</button>
                    </div>
                    ${this.notes.map((n, i) => `
                        <div class="sidebar-item ${i === this.currentNote ? 'active' : ''}" data-note-idx="${i}">
                            📝 ${n.title}
                        </div>
                    `).join('')}
                </div>
                <div style="flex:1;display:flex;flex-direction:column">
                    ${note ? `
                        <div style="padding:8px 12px;background:rgba(0,0,0,0.1);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center">
                            <input class="glass-input" id="note-title" value="${note.title}" style="font-size:14px;font-weight:500;background:transparent;border:none;color:#fff;flex:1">
                            <button class="glass-btn danger" id="note-delete" style="font-size:11px;padding:4px 10px">Xóa</button>
                        </div>
                        <textarea class="notes-editor" id="note-content">${note.content}</textarea>
                    ` : `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3)">
                            Tạo ghi chú mới để bắt đầu
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Note selection
        body.querySelectorAll('[data-note-idx]').forEach(item => {
            item.addEventListener('click', () => {
                this.saveCurrentNote();
                this.currentNote = parseInt(item.dataset.noteIdx);
                this.refresh();
            });
        });

        // New note
        body.querySelector('#notes-new')?.addEventListener('click', () => {
            this.saveCurrentNote();
            this.notes.push({
                id: 'n' + Utils.uid(),
                title: 'Ghi chú mới',
                content: ''
            });
            this.currentNote = this.notes.length - 1;
            this.refresh();
        });

        // Delete
        body.querySelector('#note-delete')?.addEventListener('click', () => {
            this.notes.splice(this.currentNote, 1);
            this.currentNote = Math.max(0, this.currentNote - 1);
            this.refresh();
        });

        // Auto-save on content change
        const contentEl = body.querySelector('#note-content');
        const titleEl = body.querySelector('#note-title');
        if (contentEl) {
            contentEl.addEventListener('input', Utils.debounce(() => this.saveCurrentNote(), 500));
        }
        if (titleEl) {
            titleEl.addEventListener('input', Utils.debounce(() => this.saveCurrentNote(), 500));
        }
    },

    saveCurrentNote() {
        const note = this.notes[this.currentNote];
        if (!note) return;

        const titleEl = document.getElementById('note-title');
        const contentEl = document.getElementById('note-content');

        if (titleEl) note.title = titleEl.value;
        if (contentEl) note.content = contentEl.value;
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() {
        this.saveCurrentNote();
        this.winId = null;
    },

    tick() {},

    serialize() {
        this.saveCurrentNote();
        return { notes: this.notes };
    },

    deserialize(data) {
        if (data.notes) this.notes = data.notes;
    }
};

AppManager.register('notes', NotesApp);
