/**
 * -------------------------------------------------------
 * guard.js
 * -------------------------------------------------------
 * Route Protection
 *
 * Depends:
 * auth.js
 * config.js
 * -------------------------------------------------------
 */

const Guard = {

    async guest() {

        if (!Auth.isAuthenticated())
            return true;

        const user = Auth.getCurrentUser();

        if (!user) {

            Auth.logout();
            return false;

        }

        this.redirectByRole(user.role);

        return false;

    },

    async auth() {

        if (!Auth.isAuthenticated()) {

            Auth.logout();
            return false;

        }

        return true;

    },

    async role(allowedRoles = []) {

        if (!(await this.auth()))
            return false;

        const user = Auth.getCurrentUser();

        if (!user) {

            Auth.logout();
            return false;

        }

        if (!allowedRoles.includes(user.role)) {

            window.location.replace("/403/");
            return false;

        }

        return true;

    },

    redirectByRole(role) {

        switch (role) {

            case "ADMIN":
                window.location.replace(
                    APP_CONFIG.ROUTES.ADMIN
                );
                break;

            case "HR":
                window.location.replace(
                    APP_CONFIG.ROUTES.HR
                );
                break;

            case "MANAGER":
                window.location.replace(
                    APP_CONFIG.ROUTES.MANAGER
                );
                break;

            default:
                window.location.replace(
                    APP_CONFIG.ROUTES.EMPLOYEE
                );

        }

    }

};

window.Guard = Object.freeze(Guard);