/**
 * =====================================================
 * user.service.js
 * =====================================================
 * User Service
 *
 * Depends:
 * api.js
 * =====================================================
 */

const UserService = {

    getCurrentUser() {
        return Api.get(window.APP_CONFIG.ENDPOINTS.CURRENT_USER);
    },

    updateProfile(data) {
        return Api.patch(window.APP_CONFIG.ENDPOINTS.CURRENT_USER, data);
    },

    changePassword(data) {
        return Api.post(
            window.APP_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
            data
        );
    },

    getDashboardStats() {
        return Api.get(
            window.APP_CONFIG.ENDPOINTS.DASHBOARD_STATS
        );
    },

    list(params = "") {

        const url = params
            ? `${window.APP_CONFIG.ENDPOINTS.USERS}?${params}`
            : window.APP_CONFIG.ENDPOINTS.USERS;

        return Api.get(url);

    },

    retrieve(id) {
        return Api.get(
            `${window.APP_CONFIG.ENDPOINTS.USERS}${id}/`
        );
    },

    create(data) {
        return Api.post(
            window.APP_CONFIG.ENDPOINTS.USERS,
            data
        );
    },

    update(id, data) {
        return Api.put(
            `${window.APP_CONFIG.ENDPOINTS.USERS}${id}/`,
            data
        );
    },

    partialUpdate(id, data) {
        return Api.patch(
            `${window.APP_CONFIG.ENDPOINTS.USERS}${id}/`,
            data
        );
    },

    delete(id) {
        return Api.delete(
            `${window.APP_CONFIG.ENDPOINTS.USERS}${id}/`
        );
    }

};

window.UserService = Object.freeze(UserService);