/**
 * hr.js
 * Populates the HR dashboard stat cards.
 * Depends on: core/config.js, core/api.js, services/dashboard.service.js
 */

document.addEventListener("DOMContentLoaded", async () => {
        
    if (!(await Guard.auth())) return;

    await loadHrStats();
    await loadHrAttendanceOverview();
});

async function loadHrStats() {
    try {
        const stats = await DashboardService.getStats();
        if (!stats) return;

        setStat("statEmployeesCount", stats.employees_count);
        setStat("statDepartmentsCount", stats.departments_count);
        setStat("statNewHiresCount", stats.new_hires_count);
    } catch (error) {
        console.error("Failed to load HR stats:", error);
    }
}

async function loadHrAttendanceOverview() {
    try {
        const endpoint = APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/";
        const data = await Api.get(endpoint);
        const records = Array.isArray(data) ? data : (data.results || []);

        const todayStr = new Date().toISOString().split('T')[0];
        const onLeaveCount = records.filter(r => r.date === todayStr && r.status === 'ON_LEAVE').length;

        setStat("statOnLeaveCount", onLeaveCount);
    } catch (error) {
        console.error("Failed to load HR attendance overview:", error);
    }
}

function setStat(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value ?? "0";
}