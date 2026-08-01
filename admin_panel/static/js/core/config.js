/**
 * config.js
 * Global application configuration.
 * Edit these values per environment (dev/staging/prod).
 */

const APP_CONFIG = Object.freeze({
    API_BASE_URL: "/api/v1",

    ENDPOINTS: Object.freeze({

        LOGIN: "/auth/login/",
        REGISTER: "/auth/register/",
        LOGOUT: "/auth/logout/",
        REFRESH_TOKEN: "/auth/refresh/",
        CURRENT_USER: "/auth/me/",
        CHANGE_PASSWORD: "/auth/change-password/",

        DASHBOARD_STATS: "/dashboard/stats/",

        USERS: "/users/",

        ROLES: "/roles/",

        PERMISSIONS: "/permissions/",

        DEPARTMENTS: "/departments/",

        EMAIL_LOGS: "/email-logs/",

        SETTINGS: "/settings/",

        FORGOT_PASSWORD: "/auth/forgot-password/",
 
        RESET_PASSWORD: "/auth/reset-password/",

        VERIFY_OTP: "/auth/verify-otp/",

    }),

    STORAGE_KEYS: Object.freeze({
        ACCESS_TOKEN: "access_token",
        REFRESH_TOKEN: "refresh_token",
        USER: "current_user",
    }),

    ROUTES: Object.freeze({
        LOGIN: "/login/",
        DASHBOARD: "/dashboard/",
    }),

    REQUEST_TIMEOUT_MS: 15000,
});

// Expose globally (no bundler in use)
window.APP_CONFIG = APP_CONFIG;