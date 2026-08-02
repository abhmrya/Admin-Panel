document.addEventListener("DOMContentLoaded", async () => {

    if (!await Guard.auth()) return;

    loadDashboard();

});

async function loadDashboard() {

    try {

        const stats = await DashboardService.getStats();

        document.getElementById("statUsersCount").textContent = stats.users_count;
        document.getElementById("statAdminsCount").textContent = stats.admins_count;
        document.getElementById("statManagersCount").textContent = stats.managers_count;
        document.getElementById("statEmployeesCount").textContent = stats.employees_count;

    } catch (error) {

        console.error(error);

    }

}