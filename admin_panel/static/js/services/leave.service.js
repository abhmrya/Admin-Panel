/**
 * ==========================================================
 * Leave Service
 * ==========================================================
 * Centralized Leave API Service
 * ==========================================================
 */

const LeaveService = {

    /* ==========================================================
       DASHBOARD
    ========================================================== */

    getDashboard() {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_DASHBOARD
        );
    },


    /* ==========================================================
       LEAVE TYPES
    ========================================================== */

    getLeaveTypes(params = "") {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_TYPES + params
        );
    },

    getLeaveType(id) {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`
        );
    },

    createLeaveType(data) {
        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_TYPES,
            data
        );
    },

    updateLeaveType(id, data) {
        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`,
            data
        );
    },

    partialUpdateLeaveType(id, data) {
        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`,
            data
        );
    },

    deleteLeaveType(id) {
        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_TYPES}${id}/`
        );
    },


    /* ==========================================================
       LEAVE BALANCES
    ========================================================== */

    getLeaveBalances(params = "") {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_BALANCES + params
        );
    },

    getLeaveBalance(id) {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`
        );
    },

    createLeaveBalance(data) {
        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_BALANCES,
            data
        );
    },

    updateLeaveBalance(id, data) {
        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`,
            data
        );
    },

    partialUpdateLeaveBalance(id, data) {
        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`,
            data
        );
    },

    deleteLeaveBalance(id) {
        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_BALANCES}${id}/`
        );
    },


    /* ==========================================================
       LEAVE REQUESTS
    ========================================================== */

    getLeaveRequests(params = "") {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS + params
        );
    },

    getLeaveRequest(id) {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`
        );
    },

    createLeaveRequest(data) {
        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS,
            data
        );
    },

    updateLeaveRequest(id, data) {
        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`,
            data
        );
    },

    partialUpdateLeaveRequest(id, data) {
        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`,
            data
        );
    },

    deleteLeaveRequest(id) {
        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/`
        );
    },


    /* ==========================================================
       LEAVE REQUEST ACTIONS
    ========================================================== */

    approveLeave(id, data = {}) {
        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/approve/`,
            data
        );
    },

    rejectLeave(id, data = {}) {
        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/reject/`,
            data
        );
    },

    cancelLeave(id) {
        return Api.post(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}${id}/cancel/`
        );
    },

    /*
     * Alias used by employee leave module.
     * Keeps the service backward compatible.
     */
    cancelLeaveRequest(id) {
        return this.cancelLeave(id);
    },


    /* ==========================================================
       LEAVE POLICIES
    ========================================================== */

    getLeavePolicies(params = "") {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_POLICIES + params
        );
    },

    getLeavePolicy(id) {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`
        );
    },

    createLeavePolicy(data) {
        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_POLICIES,
            data
        );
    },

    updateLeavePolicy(id, data) {
        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`,
            data
        );
    },

    partialUpdateLeavePolicy(id, data) {
        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`,
            data
        );
    },

    deleteLeavePolicy(id) {
        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_POLICIES}${id}/`
        );
    },


    /* ==========================================================
       LEAVE APPROVALS
    ========================================================== */

    getLeaveApprovals(params = "") {
        return Api.get(
            APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS + params
        );
    },

    getLeaveApproval(id) {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`
        );
    },

    createLeaveApproval(data) {
        return Api.post(
            APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS,
            data
        );
    },

    updateLeaveApproval(id, data) {
        return Api.put(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`,
            data
        );
    },

    partialUpdateLeaveApproval(id, data) {
        return Api.patch(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`,
            data
        );
    },

    deleteLeaveApproval(id) {
        return Api.delete(
            `${APP_CONFIG.ENDPOINTS.LEAVE_APPROVALS}${id}/`
        );
    },


    /* ==========================================================
       BACKWARD COMPATIBILITY
    ========================================================== */

    getPolicies(params = "") {
        return this.getLeavePolicies(params);
    },

    getPolicy(id) {
        return this.getLeavePolicy(id);
    },

    createPolicy(data) {
        return this.createLeavePolicy(data);
    },

    updatePolicy(id, data) {
        return this.updateLeavePolicy(id, data);
    },

    partialUpdatePolicy(id, data) {
        return this.partialUpdateLeavePolicy(id, data);
    },

    deletePolicy(id) {
        return this.deleteLeavePolicy(id);
    },

    getApprovals(params = "") {
        return this.getLeaveApprovals(params);
    },

    getApproval(id) {
        return this.getLeaveApproval(id);
    },

    createApproval(data) {
        return this.createLeaveApproval(data);
    },

    updateApproval(id, data) {
        return this.updateLeaveApproval(id, data);
    },

    partialUpdateApproval(id, data) {
        return this.partialUpdateLeaveApproval(id, data);
    },

    deleteApproval(id) {
        return this.deleteLeaveApproval(id);
    },

    getHistory(params = "") {
        return Api.get(
            `${APP_CONFIG.ENDPOINTS.LEAVE_REQUESTS}history/${params}`
        );
    },

};


/* ==========================================================
   GLOBAL SERVICE
========================================================== */

window.LeaveService = Object.freeze(LeaveService);