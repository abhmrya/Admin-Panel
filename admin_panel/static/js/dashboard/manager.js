/**
 * manager.js
 * Manager dashboard page behavior.
 * Depends on: core/config.js, core/api.js, core/auth.js, services/auth.service.js
 */

document.addEventListener("DOMContentLoaded", async () => {
        
    if (!(await Guard.auth())) return;

    await loadWelcomeMessage();
    await loadManagerAttendanceOverview();

    // TODO: once team/approvals/reports endpoints exist, populate:
    // setStat("statTeamCount", ...);
    // setStat("statPendingApprovals", ...);
    // setStat("statReportsDue", ...);
});

async function loadWelcomeMessage() {
    const welcomeEl = document.getElementById("welcomeMessage");
    if (!welcomeEl) return;

    let user = Auth.getCurrentUser();
    if (!user) {
        try {
            user = await AuthService.fetchCurrentUser();
        } catch (error) {
            console.error("Failed to load current user:", error);
            return;
        }
    }

    if (!user) return;

    const firstName = user.first_name || user.username || "";
    if (firstName) {
        welcomeEl.textContent = `Team overview and approvals — Hi, ${firstName}`;
    }
}

async function loadManagerAttendanceOverview() {
    try {
        const endpoint = APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/";
        const data = await Api.get(endpoint);
        const records = Array.isArray(data) ? data : (data.results || []);
        
        // Count today's check-ins if applicable
        const todayStr = new Date().toISOString().split('T')[0];
        const onLeaveCount = records.filter(r => r.date === todayStr && r.status === 'ON_LEAVE').length;
        
        const onLeaveEl = document.getElementById("statOnLeaveCount");
        if (onLeaveEl) {
            onLeaveEl.textContent = onLeaveCount;
        }
    } catch (error) {
        console.error("Failed to fetch manager attendance metrics:", error);
    }
}