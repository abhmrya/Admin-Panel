const ProfileService = {

    getProfile() {
        return Api.get(APP_CONFIG.ENDPOINTS.PROFILE);
    },

    updateProfile(data) {
        return Api.patch(APP_CONFIG.ENDPOINTS.PROFILE, data);
    }

};

window.ProfileService = Object.freeze(ProfileService);