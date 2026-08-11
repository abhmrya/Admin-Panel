/**
 * =====================================================
 * config.js
 * =====================================================
 */

const APP_CONFIG = Object.freeze({

    API_BASE_URL: "/api/v1",

    ENDPOINTS: Object.freeze({

        GOOGLE_LOGIN: "/auth/google/login/",
        LOGIN: "/auth/login/",
        REGISTER: "/auth/register/",
        LOGOUT: "/auth/logout/",
        REFRESH_TOKEN: "/auth/refresh/",
        CURRENT_USER: "/auth/me/",

        CHANGE_PASSWORD: "/auth/change-password/",
        FORGOT_PASSWORD: "/auth/forgot-password/",
        RESET_PASSWORD: "/auth/reset-password/",
        VERIFY_OTP: "/auth/verify-otp/",

        DASHBOARD_STATS: "/dashboard/stats/",

        USERS: "/users/",
        PROFILE: "/profile/me/",

        ROLES: "/roles/",
        PERMISSIONS: "/permissions/",
        DEPARTMENTS: "/departments/",
        EMAIL_LOGS: "/email-logs/",
        SETTINGS: "/settings/",

        AUDIT_LOGS: "/audit/logs/",

        CHAT: "/chat/",
        CHAT_CONVERSATIONS: "/chat/conversations/",

        ADD_USERS:"/add-users/"

    }),

    STORAGE_KEYS: Object.freeze({

        ACCESS_TOKEN: "access_token",
        REFRESH_TOKEN: "refresh_token",
        USER: "current_user",

    }),

    ROUTES: Object.freeze({

        LOGIN: "/login/",
        REGISTER: "/register/",

        DASHBOARD: "/dashboard/",

        ADMIN: "/dashboard/admin/",
        HR: "/dashboard/hr/",
        MANAGER: "/dashboard/manager/",
        EMPLOYEE: "/dashboard/employee/",

        FORBIDDEN: "/403/",

    }),

    REQUEST_TIMEOUT_MS: 15000,

});

window.APP_CONFIG = APP_CONFIG;