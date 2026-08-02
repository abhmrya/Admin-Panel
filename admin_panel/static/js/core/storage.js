/**
 * ==========================================================
 * storage.js
 * ==========================================================
 * Local Storage Helper
 * ==========================================================
 */

const Storage = {

    set(key, value) {

        try {

            const data =
                typeof value === "string"
                    ? value
                    : JSON.stringify(value);

            localStorage.setItem(key, data);

            return true;

        }

        catch (error) {

            console.error("Storage.set()", error);

            return false;

        }

    },

    get(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            if (value === null)
                return fallback;

            try {

                return JSON.parse(value);

            }

            catch {

                return value;

            }

        }

        catch (error) {

            console.error("Storage.get()", error);

            return fallback;

        }

    },

    has(key) {

        return localStorage.getItem(key) !== null;

    },

    remove(key) {

        localStorage.removeItem(key);

    },

    clear() {

        localStorage.clear();

    },

};

window.Storage = Object.freeze(Storage);