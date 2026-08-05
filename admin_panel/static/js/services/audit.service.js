const AuditService = {
    getLogs() {
        return Api.get(APP_CONFIG.ENDPOINTS.AUDIT_LOGS);
    }
};

window.AuditService = AuditService;
