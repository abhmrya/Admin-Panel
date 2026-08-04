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
            ? `${APP_CONFIG.ENDPOINTS.USERS}?${params}`
            : APP_CONFIG.ENDPOINTS.USERS;

        return Api.get(url);

    },

    retrieve(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`
        );

    },

    create(data) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.USERS,
            data
        );

    },

    update(id,data){

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`,
            data
        );

    },

    partialUpdate(id,data){

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`,
            data
        );

    },

    delete(id){

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`
        );

    },


    changeRole(id,role){

        return Api.patch(

            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`,

            {
                role
            }

        );

    },


    activate(id){

        return Api.patch(

            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`,

            {
                is_active:true
            }

        );

    },

    deactivate(id){

        return Api.patch(

            `${APP_CONFIG.ENDPOINTS.USERS}${id}/`,

            {
                is_active:false
            }

        );

    }

};


window.UserService = Object.freeze(UserService);