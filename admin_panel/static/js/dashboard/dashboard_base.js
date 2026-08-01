/**
 * dashboard_base.js
 * Wires up the shared dashboard shell:
 * - sidebar toggle (mobile) + overlay
 * - user dropdown menu
 * - navbar user info population
 * - IP badge
 * - logout
 * - footer year
 * - active nav link highlighting
 */

document.addEventListener("DOMContentLoaded", () => {
    initSidebarToggle();
    initUserMenu();
    initLogout();
    initFooterYear();
    initActiveNavLink();
    loadCurrentUserIntoNavbar();
    loadClientIp();
});

/* ---------------------------------- */
/* Sidebar toggle (mobile)             */
/* ---------------------------------- */
function initSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggleBtn = document.getElementById("sidebarToggle");

    if (!sidebar || !overlay || !toggleBtn) return;

    const openSidebar = () => {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
        toggleBtn.setAttribute("aria-expanded", "true");
    };

    const closeSidebar = () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
        toggleBtn.setAttribute("aria-expanded", "false");
    };

    toggleBtn.addEventListener("click", () => {
        const isOpen = !sidebar.classList.contains("-translate-x-full");
        isOpen ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);

    // Close sidebar automatically when resizing to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) {
            closeSidebar();
        }
    });
}

/* ---------------------------------- */
/* User dropdown menu                  */
/* ---------------------------------- */
function initUserMenu() {
    const menuBtn = document.getElementById("userMenuBtn");
    const menu = document.getElementById("userMenu");
    if (!menuBtn || !menu) return;

    const closeMenu = () => {
        menu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
    };

    menuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = !menu.classList.contains("hidden");
        if (isOpen) {
            closeMenu();
        } else {
            menu.classList.remove("hidden");
            menuBtn.setAttribute("aria-expanded", "true");
        }
    });

    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

/* ---------------------------------- */
/* Logout                              */
/* ---------------------------------- */
function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        logoutBtn.disabled = true;
        await AuthService.logout();
    });
}

/* ---------------------------------- */
/* Footer year                         */
/* ---------------------------------- */
function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

/* ---------------------------------- */
/* Active nav link highlighting        */
/* ---------------------------------- */
function initActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll("#sidebar nav a[href]");

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href !== "#" && href === currentPath) {
            link.classList.add("bg-indigo-50", "text-indigo-700");
            link.classList.remove("text-gray-600");
        }
    });
}

/* ---------------------------------- */
/* Navbar user info                    */
/* ---------------------------------- */
async function loadCurrentUserIntoNavbar() {
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

    const username = user.username || user.name || "";
    const email = user.email || "";
    const initials = getInitials(username || email);

    setText("navUsername", username);
    setText("navEmail", email);
    setText("ddUsername", username);
    setText("ddEmail", email);
    setText("avatarCircle", initials);
}

function getInitials(value) {
    if (!value) return "?";
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function setText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

/* ---------------------------------- */
/* IP badge                            */
/* ---------------------------------- */
function loadClientIp() {
    const ipBadge = document.getElementById("ipBadge");
    if (!ipBadge) return;

    fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
            if (data && data.ip) {
                ipBadge.textContent = `IP: ${data.ip}`;
            }
        })
        .catch((error) => {
            console.error("Failed to load client IP:", error);
        });
}