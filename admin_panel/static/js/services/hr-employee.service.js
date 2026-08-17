/**
 * ==========================================================
 * hr-employee.service.js
 * ==========================================================
 * HR Employee Management API
 * ==========================================================
 */

const HrEmployeeService = {

    endpoint: "/employees-list/",


    /**
     * ======================================================
     * LIST EMPLOYEES
     * ======================================================
     */

    list(params = {}) {

        let endpoint =
            this.endpoint;


        const query =
            new URLSearchParams();


        Object.entries(params).forEach(
            ([key, value]) => {

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {

                    query.append(
                        key,
                        value
                    );

                }

            }
        );


        const queryString =
            query.toString();


        if (queryString) {

            endpoint +=
                `?${queryString}`;

        }


        return Api.get(endpoint);

    },


    /**
     * ======================================================
     * RETRIEVE SINGLE EMPLOYEE
     * ======================================================
     */

    retrieve(id) {

        return Api.get(
            `${this.endpoint}${id}/`
        );

    },


    /**
     * ======================================================
     * UPDATE EMPLOYEE
     * ======================================================
     */

    update(id, data) {

        return Api.patch(
            `${this.endpoint}${id}/`,
            data
        );

    }

};


window.HrEmployeeService =
    Object.freeze(
        HrEmployeeService
    );