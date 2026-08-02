
/**
 * employee.js
 * Employee dashboard page behavior.
 * Populates the welcome heading and profile card from the current user.
 * The stat cards (attendance, leave balance, etc.) are placeholders until
 * their backend endpoints exist.
 * Depends on: core/config.js, core/api.js, core/auth.js, services/auth.service.js
 */

document.addEventListener("DOMContentLoaded", () => {
        
    if (!await Guard.auth()) return;

    loadEmployeeProfile();

    // TODO: once attendance/leave/documents endpoints exist, populate:
    // setStat("statAttendance", ...);
    // setStat("statLeaveBalance", ...);
    // setStat("statPendingRequests", ...);
    // setStat("statDocuments", ...);
});

async function loadEmployeeProfile() {
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

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "";
    const email = user.email || "";

    const welcomeEl = document.getElementById("welcomeMessage");
    if (welcomeEl && fullName) {
        welcomeEl.textContent = `Welcome back, ${fullName}`;
    }

    setText("profileName", fullName);
    setText("profileEmail", email);

    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) {
        avatarEl.textContent = getInitials(fullName || email);
    }
}

function setText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

function getInitials(value) {
    if (!value) return "?";
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}