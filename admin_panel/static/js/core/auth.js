/**
 * =====================================================
 * auth.js
 * =====================================================
 */

const Auth = {

    getAccessToken() {

        return Storage.get(
            window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
        );

    },

    getRefreshToken() {

        return Storage.get(
            window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
        );

    },

    setTokens({ access, refresh }) {

        if (access) {

            Storage.set(
                window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
                access
            );

        }

        if (refresh) {

            Storage.set(
                window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
                refresh
            );

        }

    },

    clearTokens() {

        Storage.remove(
            window.APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
        );

        Storage.remove(
            window.APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
        );

        Storage.remove(
            window.APP_CONFIG.STORAGE_KEYS.USER
        );

    },

    setCurrentUser(user) {

        Storage.set(
            window.APP_CONFIG.STORAGE_KEYS.USER,
            user
        );

    },

    getCurrentUser() {

        return Storage.get(
            window.APP_CONFIG.STORAGE_KEYS.USER,
            null
        );

    },

    isAuthenticated() {

        return !!this.getAccessToken();

    },

    logout() {

        this.clearTokens();

        window.location.replace(
            window.APP_CONFIG.ROUTES.LOGIN
        );

    },

    getDashboardRoute(role) {

        switch (role) {

            case "ADMIN":
                return window.APP_CONFIG.ROUTES.ADMIN;

            case "HR":
                return window.APP_CONFIG.ROUTES.HR;

            case "MANAGER":
                return window.APP_CONFIG.ROUTES.MANAGER;

            case "EMPLOYEE":
                return window.APP_CONFIG.ROUTES.EMPLOYEE;

            default:
                return window.APP_CONFIG.ROUTES.LOGIN;

        }

    }

};

window.Auth = Object.freeze(Auth);