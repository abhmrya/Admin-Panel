/**
 * ==========================================================
 * api.js
 * ==========================================================
 * Central HTTP Client
 * ==========================================================
 */

const Api = {

    timeout: APP_CONFIG.REQUEST_TIMEOUT_MS,

    getCsrfToken() {

        const input = document.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        );

        if (input)
            return input.value;

        const cookie = document.cookie
            .split("; ")
            .find(row => row.startsWith("csrftoken="));

        return cookie
            ? decodeURIComponent(cookie.split("=")[1])
            : null;

    },



    buildHeaders({

        method = "GET",

        auth = true,

        headers = {}

    } = {}) {

        const finalHeaders = {

            Accept: "application/json",

            "Content-Type": "application/json",

            ...headers,

        };



        if (auth) {

            const token =

                Auth.getAccessToken();

            if (token) {

                finalHeaders.Authorization =
                    `Bearer ${token}`;

            }

        }



        if (

            ["POST", "PUT", "PATCH", "DELETE"]

                .includes(method)

        ) {

            const csrf =

                this.getCsrfToken();

            if (csrf) {

                finalHeaders["X-CSRFToken"] =
                    csrf;

            }

        }

        return finalHeaders;

    },



    async parseResponse(response) {

        const text =
            await response.text();

        if (!text)
            return null;

        try {

            return JSON.parse(text);

        }

        catch {

            return text;

        }

    },



    async request(

        path,

        {

            method = "GET",

            body = null,

            headers = {},

            auth = true,

        } = {}

    ) {

        const controller =
            new AbortController();

        const timer =
            setTimeout(

                () => controller.abort(),

                this.timeout

            );

        try {

            const response =

                await fetch(

                    APP_CONFIG.API_BASE_URL + path,

                    {

                        method,

                        headers: this.buildHeaders({

                            method,

                            auth,

                            headers,

                        }),

                        body:

                            body
                                ? JSON.stringify(body)
                                : null,

                        signal:
                            controller.signal,

                    }

                );

            clearTimeout(timer);

            const data =

                await this.parseResponse(
                    response
                );

            if (!response.ok) {

                const error =
                    new Error(

                        data?.detail ||

                        data?.message ||

                        "Request failed."

                    );

                error.status =
                    response.status;

                error.data =
                    data;

                throw error;

            }

            return data;

        }

        catch (error) {

            clearTimeout(timer);

            if (

                error.name ===
                "AbortError"

            ) {

                const timeoutError =
                    new Error(
                        "Request timeout."
                    );

                timeoutError.status = 408;

                throw timeoutError;

            }

            throw error;

        }

    },



    get(path, options = {}) {

        return this.request(

            path,

            {

                ...options,

                method: "GET",

            }

        );

    },



    post(

        path,

        body = null,

        options = {}

    ) {

        return this.request(

            path,

            {

                ...options,

                method: "POST",

                body,

            }

        );

    },



    put(

        path,

        body = null,

        options = {}

    ) {

        return this.request(

            path,

            {

                ...options,

                method: "PUT",

                body,

            }

        );

    },



    patch(

        path,

        body = null,

        options = {}

    ) {

        return this.request(

            path,

            {

                ...options,

                method: "PATCH",

                body,

            }

        );

    },



    delete(

        path,

        options = {}

    ) {

        return this.request(

            path,

            {

                ...options,

                method: "DELETE",

            }

        );

    },

};

window.Api = Object.freeze(Api);