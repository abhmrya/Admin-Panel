/**
 * ==========================================================
 * api.js
 * ==========================================================
 * Central HTTP Client
 * ==========================================================
 */

const Api = {

    timeout: APP_CONFIG.REQUEST_TIMEOUT_MS,


    /**
     * ==========================================================
     * GET CSRF TOKEN
     * ==========================================================
     */

    getCsrfToken() {

        const csrfInput =
            document.querySelector(
                'input[name="csrfmiddlewaretoken"]'
            );

        if (csrfInput) {

            return csrfInput.value;

        }


        const csrfCookie =
            document.cookie
                .split("; ")
                .find(cookie =>
                    cookie.startsWith("csrftoken=")
                );


        return csrfCookie
            ? decodeURIComponent(
                csrfCookie.split("=")[1]
            )
            : null;

    },


    /**
     * ==========================================================
     * BUILD REQUEST HEADERS
     * ==========================================================
     */

    buildHeaders({

        method = "GET",
        auth = true,
        headers = {},
        body = null

    } = {}) {

        const finalHeaders = {

            Accept: "application/json",

            ...headers

        };


        /*
         * JSON Request
         *
         * FormData ke case mein browser khud
         * Content-Type + boundary set karega.
         */

        if (!(body instanceof FormData)) {

            finalHeaders["Content-Type"] =
                "application/json";

        }


        /*
         * JWT Authentication
         */

        if (auth) {

            const token =
                Auth.getAccessToken();

            if (token) {

                finalHeaders.Authorization =
                    `Bearer ${token}`;

            }

        }


        /*
         * Django CSRF
         */

        const csrfMethods = [
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ];


        if (csrfMethods.includes(method)) {

            const csrf =
                this.getCsrfToken();

            if (csrf) {

                finalHeaders["X-CSRFToken"] =
                    csrf;

            }

        }


        return finalHeaders;

    },


    /**
     * ==========================================================
     * PARSE RESPONSE
     * ==========================================================
     */

    async parseResponse(response) {

        const text =
            await response.text();


        if (!text) {

            return null;

        }


        try {

            return JSON.parse(text);

        }

        catch {

            return text;

        }

    },


    /**
     * ==========================================================
     * MAIN REQUEST
     * ==========================================================
     */

    async request(

        path,

        {

            method = "GET",
            body = null,
            headers = {},
            auth = true

        } = {}

    ) {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(() => {

                controller.abort();

            }, this.timeout);


        try {

            const requestBody =
                body !== null &&
                body !== undefined
                    ? body instanceof FormData
                        ? body
                        : JSON.stringify(body)
                    : null;


            const response =
                await fetch(

                    APP_CONFIG.API_BASE_URL + path,

                    {

                        method,

                        headers:
                            this.buildHeaders({

                                method,
                                auth,
                                headers,
                                body

                            }),

                        body: requestBody,

                        signal:
                            controller.signal

                    }

                );


            clearTimeout(timeout);


            const data =
                await this.parseResponse(
                    response
                );


            if (!response.ok) {

                let message =
                    "Something went wrong.";


                if (
                    data &&
                    typeof data === "object"
                ) {

                    message =
                        data.detail ||
                        data.message ||
                        data.error ||
                        message;

                }


                const error =
                    new Error(message);


                error.status =
                    response.status;


                error.data =
                    data;


                throw error;

            }


            return data;

        }

        catch (error) {

            clearTimeout(timeout);


            if (
                error.name ===
                "AbortError"
            ) {

                const timeoutError =
                    new Error(
                        "Request timeout."
                    );


                timeoutError.status =
                    408;


                throw timeoutError;

            }


            throw error;

        }

    },


    /**
     * ==========================================================
     * GET
     * ==========================================================
     */

    get(path, options = {}) {

        return this.request(

            path,

            {

                ...options,

                method: "GET"

            }

        );

    },


    /**
     * ==========================================================
     * POST
     * ==========================================================
     */

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
                body

            }

        );

    },


    /**
     * ==========================================================
     * PUT
     * ==========================================================
     */

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
                body

            }

        );

    },


    /**
     * ==========================================================
     * PATCH
     * ==========================================================
     */

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
                body

            }

        );

    },


    /**
     * ==========================================================
     * DELETE
     * ==========================================================
     */

    delete(

        path,
        options = {}

    ) {

        return this.request(

            path,

            {

                ...options,

                method: "DELETE"

            }

        );

    }

};


window.Api =
    Object.freeze(Api);