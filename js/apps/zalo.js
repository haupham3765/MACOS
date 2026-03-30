/* ============================================
   zalo.js - Zalo Chat App
   Danh sách bạn bè, nhắn tin, gọi điện
   ============================================ */

const ZaloApp = {
    winId: null,
    currentContact: null,
    messages: {},  // { contactId: [ { text, from, time } ] }
    callState: null, // null | { contactId, type, status, timer }
    callInterval: null,
    callDuration: 0,

    open() {
        if (!this.currentContact && DATA.contacts.length > 0) {
            this.currentContact = DATA.contacts[0].id;
        }
        const html = this.buildHTML();
        this.winId = WindowManager.create('zalo', 'Zalo', html, {
            width: 700, height: 520
        });
        this.bindEvents();
        this.scrollToBottom();
        return { id: 'zalo', winId: this.winId, ramUsage: 90 };
    },

    buildHTML() {
        const contact = DATA.contacts.find(c => c.id === this.currentContact);

        let html = `<div class="chat-layout">`;

        // Contact list
        html += `<div class="chat-contacts">`;
        html += `<div style="padding:10px;font-size:16px;font-weight:600;color:#fff;border-bottom:1px solid rgba(255,255,255,0.06)">💬 Zalo</div>`;
        DATA.contacts.forEach(c => {
            const lastMsg = this.getLastMessage(c.id);
            html += `
                <div class="chat-contact ${c.id === this.currentContact ? 'active' : ''}" data-contact-id="${c.id}">
                    <div class="chat-contact-avatar">${c.avatar}</div>
                    <div class="chat-contact-info">
                        <div class="chat-contact-name">${c.name}</div>
                        <div class="chat-contact-status ${c.status}">${c.status === 'online' ? '● Online' : c.lastSeen}</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        // Chat area
        if (contact) {
            html += `
                <div class="chat-main">
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="chat-contact-avatar">${contact.avatar}</div>
                            <div>
                                <div style="font-size:14px;font-weight:500;color:#fff">${contact.name}</div>
                                <div style="font-size:11px;color:${contact.status === 'online' ? '#34C759' : 'rgba(255,255,255,0.4)'}">
                                    ${contact.status === 'online' ? 'Đang hoạt động' : contact.lastSeen}
                                </div>
                            </div>
                        </div>
                        <div class="chat-header-actions">
                            <button class="chat-action-btn" data-call-type="voice" title="Gọi thoại">📞</button>
                            <button class="chat-action-btn" data-call-type="video" title="Video call">📹</button>
                        </div>
                    </div>
                    <div class="chat-messages" id="chat-messages">
            `;

            // Messages
            const msgs = this.messages[this.currentContact] || [];
            if (msgs.length === 0) {
                html += `<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px">Bắt đầu trò chuyện với ${contact.name}</div>`;
            }
            msgs.forEach(msg => {
                html += `
                    <div class="chat-msg ${msg.from === 'me' ? 'sent' : 'received'}">
                        ${msg.text}
                        <div class="chat-msg-time">${msg.time}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="chat-input-bar">
                        <input class="chat-input" id="chat-input" placeholder="Nhập tin nhắn..." autocomplete="off">
                        <button class="chat-send-btn" id="chat-send">➤</button>
                    </div>
                </div>
            `;
        } else {
            html += `<div class="chat-main" style="display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3)">Chọn người để chat</div>`;
        }

        html += `</div>`;

        // Call overlay
        if (this.callState) {
            const callContact = DATA.contacts.find(c => c.id === this.callState.contactId);
            const typeLabel = this.callState.type === 'video' ? 'Video Call' : 'Cuộc gọi thoại';
            const statusLabel = this.callState.status === 'calling' ? 'Đang gọi...' :
                               this.callState.status === 'ringing' ? 'Đang đổ chuông...' :
                               this.callState.status === 'connected' ? this.formatCallDuration() : '';

            html += `
                <div class="call-overlay">
                    <div class="call-avatar-large">${callContact?.avatar || '👤'}</div>
                    <div class="call-name">${callContact?.name || ''}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:4px">${typeLabel}</div>
                    <div class="call-status">${statusLabel}</div>
                    <div class="call-actions">
                        <button class="call-btn mute" id="call-mute">🔇</button>
                        <button class="call-btn end" id="call-end">📞</button>
                    </div>
                </div>
            `;
        }

        return html;
    },

    getLastMessage(contactId) {
        const msgs = this.messages[contactId];
        if (!msgs || msgs.length === 0) return null;
        return msgs[msgs.length - 1];
    },

    formatCallDuration() {
        const m = Math.floor(this.callDuration / 60);
        const s = this.callDuration % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        // Contact selection
        body.querySelectorAll('.chat-contact').forEach(el => {
            el.addEventListener('click', () => {
                this.currentContact = el.dataset.contactId;
                this.refresh();
                setTimeout(() => this.scrollToBottom(), 50);
            });
        });

        // Send message
        const input = body.querySelector('#chat-input');
        const sendBtn = body.querySelector('#chat-send');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        // Call buttons
        body.querySelectorAll('[data-call-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.startCall(this.currentContact, btn.dataset.callType);
            });
        });

        // End call
        const endCallBtn = body.querySelector('#call-end');
        if (endCallBtn) {
            endCallBtn.addEventListener('click', () => this.endCall());
        }
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const time = Utils.getTimeStr();

        if (!this.messages[this.currentContact]) {
            this.messages[this.currentContact] = [];
        }

        // Tin nhắn gửi đi
        this.messages[this.currentContact].push({ text, from: 'me', time });

        input.value = '';
        this.refresh();
        this.scrollToBottom();

        // Auto-reply sau 1-3 giây
        const delay = Utils.randInt(1000, 3000);
        setTimeout(() => {
            if (!this.currentContact) return;
            const reply = this.getAutoReply(text);
            if (!this.messages[this.currentContact]) {
                this.messages[this.currentContact] = [];
            }
            this.messages[this.currentContact].push({
                text: reply,
                from: 'them',
                time: Utils.getTimeStr()
            });
            this.refresh();
            this.scrollToBottom();
        }, delay);
    },

    getAutoReply(text) {
        const lower = text.toLowerCase();

        // Kiểm tra rules
        for (const [key, replies] of Object.entries(DATA.chatRules)) {
            if (key === 'default') continue;
            if (lower.includes(key)) {
                return Utils.pick(replies);
            }
        }

        // Mặc định
        return Utils.pick(DATA.chatRules.default);
    },

    scrollToBottom() {
        const msgs = document.getElementById('chat-messages');
        if (msgs) {
            msgs.scrollTop = msgs.scrollHeight;
        }
    },

    startCall(contactId, type) {
        if (this.callState) return;

        this.callState = {
            contactId,
            type,
            status: 'calling'
        };
        this.callDuration = 0;
        this.refresh();

        // Simulate ringing
        setTimeout(() => {
            if (!this.callState) return;
            this.callState.status = 'ringing';
            this.refresh();

            // Simulate connect
            setTimeout(() => {
                if (!this.callState) return;
                this.callState.status = 'connected';
                this.callInterval = setInterval(() => {
                    this.callDuration++;
                    this.refresh();
                }, 1000);
                this.refresh();
            }, Utils.randInt(2000, 4000));
        }, 1500);
    },

    endCall() {
        if (this.callInterval) {
            clearInterval(this.callInterval);
            this.callInterval = null;
        }

        if (this.callState && this.callDuration > 0) {
            const contact = DATA.contacts.find(c => c.id === this.callState.contactId);
            Desktop.notify('Zalo', `Cuộc gọi với ${contact?.name} - ${this.formatCallDuration()}`);
        }

        this.callState = null;
        this.callDuration = 0;
        this.refresh();
    },

    refresh() {
        if (!this.winId) return;
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;
        body.innerHTML = this.buildHTML();
        this.bindEvents();
    },

    close() {
        this.endCall();
        this.winId = null;
    },

    tick() {},

    serialize() {
        return { messages: this.messages };
    },

    deserialize(data) {
        if (data.messages) this.messages = data.messages;
    }
};

AppManager.register('zalo', ZaloApp);
