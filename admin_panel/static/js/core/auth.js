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

    /**
     * Returns true only if access token exists
     * AND is not expired.
     */
    isAuthenticated() {

        const token = this.getAccessToken();

        if (!token)
            return false;

        try {

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp <= currentTime) {

                console.warn("Access token expired.");

                this.clearTokens();

                return false;

            }

            return true;

        }

        catch (error) {

            console.error("Invalid JWT", error);

            this.clearTokens();

            return false;

        }

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