/**
 * =====================================================
 * dashboard.service.js
 * =====================================================
 * Dashboard Service
 * =====================================================
 */

const DashboardService = {

    getStats() {
        return Api.get(window.APP_CONFIG.ENDPOINTS.DASHBOARD_STATS);
    },

    getRecentUsers() {
        return Api.get(window.APP_CONFIG.ENDPOINTS.DASHBOARD_RECENT_USERS);
    },

    getActivities() {
        return Api.get(window.APP_CONFIG.ENDPOINTS.DASHBOARD_ACTIVITIES);
    },

    getNotifications() {
        return Api.get(window.APP_CONFIG.ENDPOINTS.NOTIFICATIONS);
    }

};

window.DashboardService = Object.freeze(DashboardService);