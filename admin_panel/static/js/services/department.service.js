const DepartmentService = {

    list() {
        return Api.get(
            APP_CONFIG.ENDPOINTS.DEPARTMENTS
        );
    }

};

window.DepartmentService = DepartmentService;