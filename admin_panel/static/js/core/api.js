/**
 * =====================================================
 * api.js
 * Central HTTP Client
 * =====================================================
 * Depends:
 * config.js
 * storage.js
 * auth.js
 * =====================================================
 */

const Api = {

    isRefreshing: false,
    refreshSubscribers: [],
    timeout: window.APP_CONFIG.REQUEST_TIMEOUT_MS,

    getCsrfToken() {

        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input) return input.value;

        const match = document.cookie.match(/(^|;\s*)csrftoken=([^;]+)/);
        return match ? decodeURIComponent(match[2]) : null;

    },

    buildHeaders({ method = "GET", auth = true, headers = {} } = {}) {

        const finalHeaders = {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...headers
        };

        if (auth) {

            const token = Auth.getAccessToken();

            if (token)
                finalHeaders.Authorization = `Bearer ${token}`;

        }

        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {

            const csrf = this.getCsrfToken();

            if (csrf)
                finalHeaders["X-CSRFToken"] = csrf;

        }

        return finalHeaders;

    },

    async parseResponse(response) {

        const text = await response.text();

        if (!text)
            return null;

        try {

            return JSON.parse(text);

        } catch {

            return text;

        }

    },

    createAbortController() {

        const controller = new AbortController();

        const timeoutId = setTimeout(
            () => controller.abort(),
            this.timeout
        );

        return {
            controller,
            timeoutId
        };

    },

    subscribeTokenRefresh(callback) {

        this.refreshSubscribers.push(callback);

    },

    notifyTokenRefreshed(token) {

        this.refreshSubscribers.forEach(cb => cb(token));

        this.refreshSubscribers = [];

    },

    async refreshAccessToken() {

        if (this.isRefreshing) {

            return new Promise(resolve => {
                this.subscribeTokenRefresh(resolve);
            });

        }

        this.isRefreshing = true;

        try {

            const refresh = Auth.getRefreshToken();

            if (!refresh)
                throw new Error("Refresh token missing.");

            const response = await fetch(

                `${APP_CONFIG.API_BASE_URL}${APP_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,

                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },

                    body: JSON.stringify({
                        refresh
                    })

                }

            );

            const data = await this.parseResponse(response);

            if (!response.ok)
                throw new Error(data?.detail || "Refresh failed.");

            Auth.setTokens({
                access: data.access,
                refresh
            });

            this.notifyTokenRefreshed(data.access);

            return data.access;

        }

        catch (error) {

            Auth.clearTokens();

            throw error;

        }

        finally {

            this.isRefreshing = false;

            this.refreshSubscribers = [];

        }

    },

    async request(
        path,
        {
            method = "GET",
            body = null,
            headers = {},
            auth = true,
            retry = true
        } = {}
    ) {

        const url = `${APP_CONFIG.API_BASE_URL}${path}`;

        const {
            controller,
            timeoutId
        } = this.createAbortController();

        try {

            const response = await fetch(url, {

                method,

                headers: this.buildHeaders({
                    method,
                    auth,
                    headers
                }),

                body: body ? JSON.stringify(body) : null,

                signal: controller.signal

            });

            clearTimeout(timeoutId);

            const data = await this.parseResponse(response);

            if (response.status === 401 && auth && retry) {

                try {

                    await this.refreshAccessToken();

                    return this.request(path, {
                        method,
                        body,
                        headers,
                        auth,
                        retry: false
                    });

                } catch (error) {

                    Auth.clearTokens();
                    window.location.href = window.APP_CONFIG.ROUTES.LOGIN;

                    throw error;

                }

            }

            if (!response.ok) {

                const error = new Error(
                    data?.detail ||
                    data?.message ||
                    "Request failed."
                );

                error.status = response.status;
                error.data = data;

                throw error;

            }

            return data;

        } catch (error) {

            clearTimeout(timeoutId);

            if (error.name === "AbortError") {

                const timeoutError = new Error("Request timeout.");

                timeoutError.status = 408;

                throw timeoutError;

            }

            throw error;

        }

    },

    get(path, options = {}) {
        return this.request(path, {
            ...options,
            method: "GET"
        });
    },

    post(path, body = null, options = {}) {
        return this.request(path, {
            ...options,
            method: "POST",
            body
        });
    },

    put(path, body = null, options = {}) {
        return this.request(path, {
            ...options,
            method: "PUT",
            body
        });
    },

    patch(path, body = null, options = {}) {
        return this.request(path, {
            ...options,
            method: "PATCH",
            body
        });
    },

    delete(path, options = {}) {
        return this.request(path, {
            ...options,
            method: "DELETE"
        });
    }

};

window.Api = Object.freeze(Api);