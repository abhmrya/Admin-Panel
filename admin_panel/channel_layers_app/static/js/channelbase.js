/**
 * =====================================================
 * channelbase.js
 * =====================================================
 *
 * Uses Admin Panel's centralized Auth system.
 *
 * Required globally:
 * - Storage
 * - APP_CONFIG
 * - Auth
 */

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    /*
     * =====================================================
     * LOGOUT
     * =====================================================
     *
     * Do NOT use:
     *
     * fetch("/api/logout/")
     *
     * because authentication/logout is handled centrally
     * by Admin Panel's Auth service.
     */

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();

            if (window.Auth && typeof window.Auth.logout === "function") {
                window.Auth.logout();
            } else {
                console.error("Auth.logout() is not available.");
            }
        });
    }
});