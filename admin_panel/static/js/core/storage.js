/**
 * storage.js
 * Thin, safe wrapper around localStorage.
 * Centralizes JSON parsing and error handling.
 */

const Storage = {
    set(key, value) {
        try {
            const serialized = typeof value === "string" ? value : JSON.stringify(value);
            window.localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Storage.set failed for key "${key}":`, error);
        }
    },

    get(key, fallback = null) {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw === null) return fallback;

            try {
                return JSON.parse(raw);
            } catch {
                // Not JSON, return raw string (e.g. plain tokens)
                return raw;
            }
        } catch (error) {
            console.error(`Storage.get failed for key "${key}":`, error);
            return fallback;
        }
    },

    remove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Storage.remove failed for key "${key}":`, error);
        }
    },

    clear() {
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error("Storage.clear failed:", error);
        }
    },
};

window.Storage = Storage;