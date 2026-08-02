/**
 * =====================================================
 * dashboard.js
 * =====================================================
 * Dashboard Entry Point
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

    if (!await Guard.auth())
        return;

    let user = Auth.getCurrentUser();

    if (!user) {

        try {

            user = await UserService.me();

        } catch (error) {

            console.error(error);

            Auth.logout();

            return;

        }

    }

    redirectDashboard(user);

});


function redirectDashboard(user) {

    switch (user.role) {

        case "ADMIN":

            window.location.replace(
                window.APP_CONFIG.ROUTES.ADMIN
            );

            break;

        case "HR":

            window.location.replace(
                window.APP_CONFIG.ROUTES.HR
            );

            break;

        case "MANAGER":

            window.location.replace(
                window.APP_CONFIG.ROUTES.MANAGER
            );

            break;

        case "EMPLOYEE":

            window.location.replace(
                window.APP_CONFIG.ROUTES.EMPLOYEE
            );

            break;

        default:

            Auth.logout();

    }

}