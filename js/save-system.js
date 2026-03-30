/* ============================================
   save-system.js - Lưu/Load bằng localStorage
   ============================================ */

const SaveSystem = {
    SAVE_KEY: 'macos-liquid-glass-save',

    /**
     * Lưu toàn bộ trạng thái
     */
    save() {
        try {
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                system: SystemServices.serialize(),
                apps: AppManager.serialize(),
                notes: NotesApp ? NotesApp.serialize() : {},
                assets: typeof AssetShopApp !== 'undefined' ? AssetShopApp.serialize() : {},
                casino: typeof CasinoApp !== 'undefined' ? CasinoApp.serialize() : {},
                zaloMessages: typeof ZaloApp !== 'undefined' ? ZaloApp.serialize() : {}
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.warn('Save failed:', e);
            return false;
        }
    },

    /**
     * Load trạng thái
     */
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data || data.version !== 1) return false;

            // Load system
            if (data.system) SystemServices.deserialize(data.system);
            if (data.apps) AppManager.deserialize(data.apps);
            if (data.notes && typeof NotesApp !== 'undefined') NotesApp.deserialize(data.notes);
            if (data.assets && typeof AssetShopApp !== 'undefined') AssetShopApp.deserialize(data.assets);
            if (data.casino && typeof CasinoApp !== 'undefined') CasinoApp.deserialize(data.casino);
            if (data.zaloMessages && typeof ZaloApp !== 'undefined') ZaloApp.deserialize(data.zaloMessages);

            return true;
        } catch (e) {
            console.warn('Load failed:', e);
            return false;
        }
    },

    /**
     * Xóa save
     */
    clear() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    /**
     * Kiểm tra có save không
     */
    hasSave() {
        return !!localStorage.getItem(this.SAVE_KEY);
    }
};
