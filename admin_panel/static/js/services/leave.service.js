/**
 * ==========================================================
 * Leave Service
 * ==========================================================
 * Centralized Leave API Service
 * ==========================================================
 */

const LeaveService = {

    /**
     * ==========================================================
     * DASHBOARD
     * ==========================================================
     */

    getDashboard() {

        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_DASHBOARD
        );

    },


    /**
     * ==========================================================
     * LEAVE TYPES
     * ==========================================================
     */

    getLeaveTypes(params = "") {

        const path =
            APP_CONFIG.ENDPOINTS.LEAVE_TYPES +
            params;

        return Api.get(path);

    },


    getLeaveType(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`
        );

    },


    createLeaveType(body) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_TYPES,
            body
        );

    },


    updateLeaveType(id, body) {

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`,
            body
        );

    },


    partialUpdateLeaveType(id, body) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`,
            body
        );

    },


    deleteLeaveType(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`
        );

    },


    /**
     * ==========================================================
     * LEAVE BALANCES
     * ==========================================================
     */

    getLeaveBalances(params = "") {

        const path =
            APP_CONFIG.ENDPOINTS.LEAVE_BALANCES +
            params;

        return Api.get(path);

    },


    getLeaveBalance(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`
        );

    },


    createLeaveBalance(body) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_BALANCES,
            body
        );

    },


    updateLeaveBalance(id, body) {

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`,
            body
        );

    },


    partialUpdateLeaveBalance(id, body) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`,
            body
        );

    },


    deleteLeaveBalance(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`
        );

    },


    /**
     * ==========================================================
     * LEAVE REQUESTS
     * ==========================================================
     */

    getLeaveRequests(params = "") {

        const path =
            APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS +
            params;

        return Api.get(path);

    },


    getLeaveRequest(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`
        );

    },


    createLeaveRequest(body) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS,
            body
        );

    },


    updateLeaveRequest(id, body) {

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`,
            body
        );

    },


    partialUpdateLeaveRequest(id, body) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`,
            body
        );

    },


    deleteLeaveRequest(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`
        );

    },


    /**
     * ==========================================================
     * LEAVE REQUEST ACTIONS
     * ==========================================================
     */

    approveLeave(id, body = {}) {

        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/approve/`,
            body
        );

    },


    rejectLeave(id, body = {}) {

        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/reject/`,
            body
        );

    },


    cancelLeave(id) {

        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/cancel/`
        );

    },


    /**
     * ==========================================================
     * LEAVE POLICIES
     * ==========================================================
     */

    getPolicies(params = "") {

        const path =
            APP_CONFIG.ENDPOINTS.LEAVE_POLICIES +
            params;

        return Api.get(path);

    },


    getPolicy(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`
        );

    },


    createPolicy(body) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_POLICIES,
            body
        );

    },


    updatePolicy(id, body) {

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`,
            body
        );

    },


    partialUpdatePolicy(id, body) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`,
            body
        );

    },


    deletePolicy(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`
        );

    },


    /**
     * ==========================================================
     * LEAVE APPROVALS
     * ==========================================================
     */

    getApprovals(params = "") {

        const path =
            APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS +
            params;

        return Api.get(path);

    },


    getApproval(id) {

        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`
        );

    },


    createApproval(body) {

        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS,
            body
        );

    },


    updateApproval(id, body) {

        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`,
            body
        );

    },


    partialUpdateApproval(id, body) {

        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`,
            body
        );

    },


    deleteApproval(id) {

        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`
        );

    }

};


window.LeaveService = Object.freeze(
    LeaveService
);