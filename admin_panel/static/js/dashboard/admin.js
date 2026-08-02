document.addEventListener("DOMContentLoaded", async () => {

    if (!await Guard.auth()) return;

    loadDashboard();

});

async function loadDashboard() {

    try {

        const stats = await DashboardService.getStats();

        setStat("statUsersCount", stats.users_count);
        setStat("statAdminsCount", stats.admins_count);
        setStat("statManagersCount", stats.managers_count);
        setStat("statEmployeesCount", stats.employees_count);

    } catch (error) {

        console.error(error);

    }

}

function setStat(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}