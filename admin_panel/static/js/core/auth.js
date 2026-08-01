/**
 * auth.js
 * Low-level authentication state helpers.
 * No API calls here — that lives in services/auth.service.js.
 */

const Auth = {
    getAccessToken() {
        return Storage.get(window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    },

    getRefreshToken() {
        return Storage.get(window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    },

    setTokens({ access, refresh }) {
        if (access) Storage.set(window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access);
        if (refresh) Storage.set(window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refresh);
    },

    clearTokens() {
        Storage.remove(window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        Storage.remove(window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        Storage.remove(window.APP_CONFIG.STORAGE_KEYS.USER);
    },

    setCurrentUser(user) {
        Storage.set(window.APP_CONFIG.STORAGE_KEYS.USER, user);
    },

    getCurrentUser() {
        return Storage.get(window.APP_CONFIG.STORAGE_KEYS.USER, null);
    },

    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) return false;
        return !this.isTokenExpired(token);
    },

    /**
     * Decodes a JWT payload without verifying the signature.
     * Verification always happens server-side.
     */
    decodeToken(token) {
        try {
            const payload = token.split(".")[1];
            const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
            return JSON.parse(decoded);
        } catch (error) {
            console.error("Auth.decodeToken failed:", error);
            return null;
        }
    },

    isTokenExpired(token) {
        const payload = this.decodeToken(token);
        if (!payload || !payload.exp) return true;
        const nowInSeconds = Date.now() / 1000;
        return payload.exp < nowInSeconds;
    },

    logout() {
        this.clearTokens();
        window.location.href = window.APP_CONFIG.ROUTES.LOGIN;
    },
};

window.Auth = Auth;