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
     * Get CSRF Token
     */
    getCsrfToken() {

        const csrfInput = document.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        );

        if (csrfInput) {
            return csrfInput.value;
        }


        const csrfCookie = document.cookie
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
     * Build Request Headers
     */
    buildHeaders({

        method = "GET",
        auth = true,
        headers = {}

    } = {}) {


        const finalHeaders = {

            Accept: "application/json",

            "Content-Type": "application/json",

            ...headers

        };


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
         * Django CSRF Protection
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
     * Parse API Response
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
     * Main Request Handler
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


            const response =
                await fetch(

                    APP_CONFIG.API_BASE_URL + path,

                    {

                        method,


                        headers:
                            this.buildHeaders({

                                method,

                                auth,

                                headers

                            }),


                        body:
                            body
                                ? JSON.stringify(body)
                                : null,


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


                const error =
                    new Error(

                        data?.detail ||

                        data?.message ||

                        "Something went wrong."

                    );


                error.status =
                    response.status;


                error.data =
                    data;


                throw error;

            }



            return data;


        }


        catch(error) {


            clearTimeout(timeout);



            if (
                error.name === "AbortError"
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
     * GET Request
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
     * POST Request
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
     * PUT Request
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
     * PATCH Request
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
     * DELETE Request
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


window.Api = Object.freeze(Api);