document.addEventListener("DOMContentLoaded", () => {

    const roleElement =
        document.getElementById("sidebarUserRole");


    if (!roleElement) return;


    const user =
        Auth.getCurrentUser();


    if (user) {

        roleElement.innerText =
            user.role;

    }

});