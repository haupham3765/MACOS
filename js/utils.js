/* ============================================
   utils.js - Hàm tiện ích dùng chung
   ============================================ */

const Utils = {
    /**
     * Tạo ID duy nhất
     */
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Format số với dấu phẩy
     */
    formatNumber(n) {
        if (n === undefined || n === null) return '0';
        return n.toLocaleString('vi-VN');
    },

    /**
     * Format dung lượng (MB)
     */
    formatSize(mb) {
        if (mb < 1) return (mb * 1024).toFixed(0) + ' KB';
        if (mb < 1024) return mb.toFixed(1) + ' MB';
        if (mb < 1048576) return (mb / 1024).toFixed(2) + ' GB';
        if (mb < 1073741824) return (mb / 1048576).toFixed(2) + ' TB';
        return (mb / 1073741824).toFixed(2) + ' PB';
    },

    /**
     * Format tiền ($)
     */
    formatMoney(amount) {
        if (amount >= 1e9) return '$' + (amount / 1e9).toFixed(2) + 'B';
        if (amount >= 1e6) return '$' + (amount / 1e6).toFixed(2) + 'M';
        if (amount >= 1e3) return '$' + (amount / 1e3).toFixed(1) + 'K';
        return '$' + amount.toFixed(2);
    },

    /**
     * Format thời gian còn lại
     */
    formatTime(seconds) {
        if (seconds < 60) return Math.ceil(seconds) + 's';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + Math.ceil(seconds % 60) + 's';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h + 'h ' + m + 'm';
    },

    /**
     * Format tốc độ (MB/s)
     */
    formatSpeed(mbps) {
        if (mbps < 1) return (mbps * 1024).toFixed(0) + ' KB/s';
        if (mbps < 1024) return mbps.toFixed(1) + ' MB/s';
        return (mbps / 1024).toFixed(2) + ' GB/s';
    },

    /**
     * Clamp giá trị trong khoảng
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Random số trong khoảng
     */
    rand(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random số nguyên
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Chọn ngẫu nhiên từ mảng
     */
    pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * Tạo element từ HTML string
     */
    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        return div.firstChild;
    },

    /**
     * Lấy thời gian hiện tại dạng HH:MM
     */
    getTimeStr() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0');
    },

    /**
     * Lấy ngày hiện tại
     */
    getDateStr() {
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
                       'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];
        const now = new Date();
        return days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
    },

    /**
     * Debounce function
     */
    debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     */
    throttle(fn, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
