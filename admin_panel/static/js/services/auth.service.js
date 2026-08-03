const AuthService = {

    async login(email, password) {

        const data = await Api.post(
            window.APP_CONFIG.ENDPOINTS.LOGIN,
            { email, password },
            { auth: false }
        );

        Auth.setTokens({
            access: data.tokens.access,
            refresh: data.tokens.refresh
        });

        Auth.setCurrentUser(data.user);

        return data;

    },

    async googleLogin(credential) {

        const data = await Api.post(

            window.APP_CONFIG.ENDPOINTS.GOOGLE_LOGIN,

            {
                credential
            },

            {
                auth: false
            }

        );

        Auth.setTokens({

            access: data.tokens.access,
            refresh: data.tokens.refresh

        });

        Auth.setCurrentUser(data.user);

        return data;

    },

    register(payload) {

        return Api.post(
            window.APP_CONFIG.ENDPOINTS.REGISTER,
            payload,
            { auth: false }
        );

    },

    async logout() {

        try {

            const refresh = Auth.getRefreshToken();

            if (refresh) {

                await Api.post(
                    window.APP_CONFIG.ENDPOINTS.LOGOUT,
                    { refresh }
                );

            }

        } finally {

            Auth.clearTokens();

            window.location.replace(
                window.APP_CONFIG.ROUTES.LOGIN
            );

        }

    },

    async fetchCurrentUser(force = false) {

        if (!force) {

            const cached = Auth.getCurrentUser();

            if (cached) return cached;

        }

        const user = await Api.get(
            window.APP_CONFIG.ENDPOINTS.CURRENT_USER
        );

        Auth.setCurrentUser(user);

        return user;

    },

    refreshToken() {

        return Api.post(

            window.APP_CONFIG.ENDPOINTS.REFRESH_TOKEN,

            {
                refresh: Auth.getRefreshToken()
            },

            {
                auth: false
            }

        );

    },

    forgotPassword(email) {

        return Api.post(

            window.APP_CONFIG.ENDPOINTS.FORGOT_PASSWORD,

            { email },

            { auth: false }

        );

    },

    resetPassword(payload) {

        return Api.post(

            window.APP_CONFIG.ENDPOINTS.RESET_PASSWORD,

            payload,

            { auth: false }

        );

    },

    verifyOtp(payload) {

        return Api.post(

            window.APP_CONFIG.ENDPOINTS.VERIFY_OTP,

            payload,

            { auth: false }

        );

    }

};

window.AuthService = Object.freeze(AuthService);