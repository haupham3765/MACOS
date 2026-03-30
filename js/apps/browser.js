/* ============================================
   browser.js - Trình duyệt Safari giả lập
   Fake websites từ dữ liệu có sẵn
   ============================================ */

const BrowserApp = {
    winId: null,
    currentUrl: 'news.vn',

    open() {
        const html = this.buildHTML();
        this.winId = WindowManager.create('browser', 'Safari', html, {
            width: 800, height: 550
        });
        this.bindEvents();
        this.loadPage('news.vn');
        return { id: 'browser', winId: this.winId, ramUsage: 150 };
    },

    buildHTML() {
        return `
            <div style="display:flex;flex-direction:column;height:100%">
                <div class="browser-toolbar">
                    <button class="browser-nav-btn" id="browser-back">◀</button>
                    <button class="browser-nav-btn" id="browser-forward">▶</button>
                    <button class="browser-nav-btn" id="browser-refresh">🔄</button>
                    <input class="browser-url-bar" id="browser-url" value="https://news.vn" placeholder="Nhập địa chỉ...">
                    <button class="browser-nav-btn" id="browser-go">→</button>
                </div>
                <div class="browser-content" id="browser-content" style="flex:1;overflow-y:auto;padding:20px">
                    <div style="text-align:center;color:rgba(255,255,255,0.4);padding:60px">Đang tải...</div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const body = document.getElementById(this.winId + '-body');
        if (!body) return;

        const urlInput = body.querySelector('#browser-url');
        const goBtn = body.querySelector('#browser-go');
        const refreshBtn = body.querySelector('#browser-refresh');

        goBtn.addEventListener('click', () => {
            let url = urlInput.value.replace('https://', '').replace('http://', '').trim();
            this.loadPage(url);
        });

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let url = urlInput.value.replace('https://', '').replace('http://', '').trim();
                this.loadPage(url);
            }
        });

        refreshBtn.addEventListener('click', () => {
            this.loadPage(this.currentUrl);
        });
    },

    loadPage(url) {
        this.currentUrl = url;
        const content = document.getElementById('browser-content');
        const urlInput = document.getElementById('browser-url');
        if (!content) return;
        if (urlInput) urlInput.value = 'https://' + url;

        // Tìm website trong dữ liệu
        const site = DATA.websites[url];

        if (site) {
            if (site.articles) {
                // Trang tin tức
                let html = `<div style="max-width:700px;margin:0 auto">
                    <h1 style="font-size:24px;margin-bottom:20px;color:#fff">${site.title}</h1>`;
                site.articles.forEach(art => {
                    html += `
                        <div class="browser-article">
                            <h2>${art.title}</h2>
                            <p>${art.content}</p>
                        </div>
                    `;
                });
                html += '</div>';
                content.innerHTML = html;
            } else if (site.content) {
                content.innerHTML = site.content;
            }
        } else {
            // Trang không tìm thấy → hiện tin tức ngẫu nhiên
            this.loadRandomNews(content);
        }
    },

    loadRandomNews(content) {
        let html = `<div style="max-width:700px;margin:0 auto">
            <h1 style="font-size:24px;margin-bottom:20px;color:#fff">📰 Tin tức mới nhất</h1>`;

        // Xáo trộn và hiển thị
        const shuffled = [...DATA.newsArticles].sort(() => Math.random() - 0.5);
        shuffled.forEach(art => {
            html += `
                <div class="browser-article">
                    <h2>${art.title}</h2>
                    <p>${art.body}</p>
                </div>
            `;
        });

        html += '</div>';
        content.innerHTML = html;
    },

    close() { this.winId = null; },
    tick() {}
};

AppManager.register('browser', BrowserApp);
