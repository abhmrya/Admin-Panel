as/**
 * manager.js
 * Manager dashboard page behavior.
 * No team-specific backend endpoints exist yet, so the stat cards here
 * stay as static placeholders — wire them up to real APIs once available.
 * Depends on: core/config.js, core/api.js, core/auth.js, services/auth.service.js
 */

document.addEventListener("DOMContentLoaded", () => {
        
    if (!await Guard.auth()) return;

    loadWelcomeMessage();

    // TODO: once team/approvals/reports endpoints exist, populate:
    // setStat("statTeamCount", ...);
    // setStat("statPendingApprovals", ...);
    // setStat("statOnLeaveCount", ...);
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