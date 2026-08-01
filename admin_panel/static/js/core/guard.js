/**
 * -------------------------------------------------------
 * guard.js
 * -------------------------------------------------------
 * Route protection helpers
 *
 * Depends:
 * - auth.js
 * - config.js
 *
 * -------------------------------------------------------
 */

const Guard = {

    /**
     * Protect authenticated pages
     * Example:
     * await Guard.auth();
     */
    async auth() {

        if (!Auth.isAuthenticated()) {

            Auth.logout();

            return false;

        }

        return true;

    },

    /**
     * Prevent authenticated users
     * from opening Login/Register pages.
     *
     * Example:
     * await Guard.guest();
     */

    async guest() {

        if (Auth.isAuthenticated()) {

            window.location.href =
                window.APP_CONFIG.ROUTES.DASHBOARD;

            return false;

        }

        return true;

    },

    /**
     * Role Based Guard
     *
     * Example
     *
     * await Guard.role(["ADMIN"])
     *
     */

    async role(allowedRoles = []) {

        const user = Auth.getCurrentUser();

        if (!user) {

            Auth.logout();

            return false;

        }

        if (
            !allowedRoles.includes(user.role)
        ) {

            window.location.href =
                "/403/";

            return false;

        }

        return true;

    },

    /**
     * Permission Guard
     */

    permission(permissionName) {

        const user =
            Auth.getCurrentUser();

        if (!user)
            return false;

        if (!user.permissions)
            return false;

        return user.permissions.includes(
            permissionName
        );

    }

};

window.Guard = Guard;