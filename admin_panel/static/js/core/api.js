/**
 * ==========================================================
 * api.js
 * ==========================================================
 * Central HTTP Client
 *
 * Responsibilities:
 * - GET / POST / PUT / PATCH / DELETE
 * - JWT Authentication
 * - CSRF
 * - JSON / FormData
 * - Request Timeout
 * - Centralized Error Handling
 * - DRF Validation Error Extraction
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


        if (csrfMethods.includes(
            method.toUpperCase()
        )) {

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
     * EXTRACT ERROR MESSAGE
     *
     * Handles:
     *
     * {
     *     "detail": "..."
     * }
     *
     * {
     *     "message": "..."
     * }
     *
     * {
     *     "error": "..."
     * }
     *
     * {
     *     "balance": "..."
     * }
     *
     * {
     *     "start_date": "..."
     * }
     *
     * {
     *     "non_field_errors": ["..."]
     * }
     *
     * {
     *     "field": ["error 1", "error 2"]
     * }
     * ==========================================================
     */

    extractErrorMessage(data) {

        if (!data) {

            return "Something went wrong.";

        }


        /*
         * Plain text response
         */

        if (typeof data === "string") {

            return data.trim() ||
                "Something went wrong.";

        }


        /*
         * Array response
         */

        if (Array.isArray(data)) {

            const messages =
                this.extractMessagesFromArray(data);

            return messages ||
                "Something went wrong.";

        }


        /*
         * Object response
         */

        if (typeof data === "object") {


            /*
             * Standard API messages
             */

            if (
                typeof data.detail === "string" &&
                data.detail.trim()
            ) {

                return data.detail.trim();

            }


            if (
                typeof data.message === "string" &&
                data.message.trim()
            ) {

                return data.message.trim();

            }


            if (
                typeof data.error === "string" &&
                data.error.trim()
            ) {

                return data.error.trim();

            }


            /*
             * errors wrapper
             *
             * {
             *     "errors": {
             *         "start_date": "..."
             *     }
             * }
             */

            if (data.errors) {

                const nestedMessage =
                    this.extractErrorMessage(
                        data.errors
                    );

                if (
                    nestedMessage &&
                    nestedMessage !==
                    "Something went wrong."
                ) {

                    return nestedMessage;

                }

            }


            /*
             * DRF validation errors
             *
             * {
             *     "balance":
             *         "Leave balance is not configured..."
             * }
             */

            const messages = [];


            Object.entries(data).forEach(
                ([field, value]) => {

                    /*
                     * Ignore standard keys already handled.
                     */

                    if (
                        field === "detail" ||
                        field === "message" ||
                        field === "error" ||
                        field === "errors"
                    ) {

                        return;

                    }


                    /*
                     * String error
                     */

                    if (
                        typeof value === "string" &&
                        value.trim()
                    ) {

                        messages.push(
                            value.trim()
                        );

                        return;

                    }


                    /*
                     * Array error
                     */

                    if (Array.isArray(value)) {

                        const arrayMessage =
                            this.extractMessagesFromArray(
                                value
                            );

                        if (arrayMessage) {

                            messages.push(
                                arrayMessage
                            );

                        }

                        return;

                    }


                    /*
                     * Nested object error
                     */

                    if (
                        value &&
                        typeof value === "object"
                    ) {

                        const nestedMessage =
                            this.extractErrorMessage(
                                value
                            );

                        if (
                            nestedMessage &&
                            nestedMessage !==
                            "Something went wrong."
                        ) {

                            messages.push(
                                nestedMessage
                            );

                        }

                    }

                }
            );


            if (messages.length) {

                return [
                    ...new Set(messages)
                ].join(" ");

            }

        }


        return "Something went wrong.";

    },


    /**
     * ==========================================================
     * EXTRACT ARRAY MESSAGES
     * ==========================================================
     */

    extractMessagesFromArray(values) {

        const messages = [];


        values.forEach(value => {

            if (
                typeof value === "string" &&
                value.trim()
            ) {

                messages.push(
                    value.trim()
                );

                return;

            }


            if (Array.isArray(value)) {

                const nested =
                    this.extractMessagesFromArray(
                        value
                    );

                if (nested) {

                    messages.push(nested);

                }

                return;

            }


            if (
                value &&
                typeof value === "object"
            ) {

                const nested =
                    this.extractErrorMessage(
                        value
                    );

                if (
                    nested &&
                    nested !==
                    "Something went wrong."
                ) {

                    messages.push(nested);

                }

            }

        });


        return [
            ...new Set(messages)
        ].join(" ");

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

            /*
             * Prepare request body
             */

            const requestBody =
                body !== null &&
                body !== undefined
                    ? body instanceof FormData
                        ? body
                        : JSON.stringify(body)
                    : null;


            /*
             * Send request
             */

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


            /*
             * Parse response
             */

            const data =
                await this.parseResponse(
                    response
                );


            /*
             * HTTP ERROR
             */

            if (!response.ok) {

                const message =
                    this.extractErrorMessage(
                        data
                    );


                /*
                 * Create proper Error
                 */

                const error =
                    new Error(message);


                /*
                 * Keep useful information
                 * for frontend modules.
                 */

                error.status =
                    response.status;

                error.data =
                    data;

                error.response =
                    response;


                /*
                 * Console debugging
                 *
                 * Isse developer ko actual
                 * backend error hamesha milega.
                 */

                console.error(
                    "API Request Error:",
                    {
                        status: response.status,
                        path,
                        method,
                        data,
                        message
                    }
                );


                throw error;

            }


            /*
             * Successful response
             */

            return data;

        }

        catch (error) {

            clearTimeout(timeout);


            /*
             * Request timeout
             */

            if (
                error.name ===
                "AbortError"
            ) {

                const timeoutError =
                    new Error(
                        "Request timeout. Please try again."
                    );


                timeoutError.status =
                    408;


                timeoutError.code =
                    "REQUEST_TIMEOUT";


                throw timeoutError;

            }


            /*
             * Network error
             *
             * fetch() fail hone par
             * response available nahi hota.
             */

            if (
                !error.status &&
                !error.data
            ) {

                console.error(
                    "Network/API Error:",
                    error
                );

            }


            /*
             * Original error ko preserve karo.
             *
             * Important:
             * Backend validation error ko
             * dobara generic error mein convert
             * nahi karna hai.
             */

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


/**
 * ==========================================================
 * GLOBAL API OBJECT
 * ==========================================================
 */

window.Api =
    Object.freeze(Api);