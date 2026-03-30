/* ============================================
   main.js - Entry point
   Khởi tạo hệ điều hành khi trang tải xong
   ============================================ */

// Đợi DOM sẵn sàng rồi khởi động
document.addEventListener('DOMContentLoaded', () => {
    // Khởi động OS
    OS.init();
});

// Auto-save mỗi 30 giây
setInterval(() => {
    if (OS.state === 'desktop') {
        SaveSystem.save();
    }
}, 30000);

// Lưu khi đóng tab
window.addEventListener('beforeunload', () => {
    if (OS.state === 'desktop') {
        SaveSystem.save();
    }
});

// Ngăn context menu mặc định (giống OS thật)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Xử lý phím tắt
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S → Save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (OS.state === 'desktop') {
            SaveSystem.save();
            Desktop.notify('Hệ thống', 'Đã lưu game!');
        }
    }
});
