/**
 * ==========================================================
 * user-update.service.js
 * ==========================================================
 */

const UserUpdateService = {

    endpoint: "/updateuseradmin/",

    /**
     * Get Single User
     */
    retrieve(id) {

        return Api.get(
            `${this.endpoint}${id}/`
        );

    },

    /**
     * Update User
     */
    update(id, data) {

        return Api.patch(
            `${this.endpoint}${id}/`,
            data
        );

    }

};

window.UserUpdateService = Object.freeze(
    UserUpdateService
);