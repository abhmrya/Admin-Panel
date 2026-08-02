/**
 * =====================================================
 * dashboard_base.js
 * =====================================================
 * Shared Dashboard Controller
 *
 * Features
 * - Auth Guard
 * - Sidebar Toggle
 * - User Dropdown
 * - Logout
 * - Footer Year
 * - Active Sidebar
 * - Current User
 * - Client IP
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

    if (!Guard.auth())
        return;

    initSidebarToggle();

    initUserMenu();

    initLogout();

    initFooterYear();

    initActiveNavLink();

    await loadCurrentUser();


});


/* =====================================================
   Sidebar
===================================================== */

function initSidebarToggle() {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggle = document.getElementById("sidebarToggle");

    if (!sidebar || !overlay || !toggle)
        return;

    const open = () => {

        sidebar.classList.remove("-translate-x-full");

        overlay.classList.remove("hidden");

        toggle.setAttribute("aria-expanded", "true");

    };

    const close = () => {

        sidebar.classList.add("-translate-x-full");

        overlay.classList.add("hidden");

        toggle.setAttribute("aria-expanded", "false");

    };

    toggle.addEventListener("click", () => {

        sidebar.classList.contains("-translate-x-full")

            ? open()

            : close();

    });

    overlay.addEventListener("click", close);

    window.addEventListener("resize", () => {

        if (window.innerWidth >= 1024)

            close();

    });

}


/* =====================================================
   User Menu
===================================================== */

function initUserMenu() {

    const btn = document.getElementById("userMenuBtn");
    const menu = document.getElementById("userMenu");

    if (!btn || !menu)
        return;

    const close = () => {

        menu.classList.add("hidden");

        btn.setAttribute(
            "aria-expanded",
            "false"
        );

    };

    btn.addEventListener("click", event => {

        event.stopPropagation();

        menu.classList.toggle("hidden");

        btn.setAttribute(

            "aria-expanded",

            !menu.classList.contains("hidden")

        );

    });

    document.addEventListener("click", event => {

        if (

            !menu.contains(event.target) &&

            !btn.contains(event.target)

        ) {

            close();

        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape")

            close();

    });

}


/* =====================================================
   Logout
===================================================== */

function initLogout() {

    const btn = document.getElementById("logoutBtn");

    if (!btn)
        return;

    btn.addEventListener("click", async () => {

        btn.disabled = true;

        try {

            await AuthService.logout();

        }

        finally {

            btn.disabled = false;

        }

    });

}


/* =====================================================
   Footer
===================================================== */

function initFooterYear() {

    const year = document.getElementById("year");

    if (year)

        year.textContent =

            new Date().getFullYear();

}


/* =====================================================
   Active Sidebar Link
===================================================== */

function initActiveNavLink() {

    const current = window.location.pathname;

    document

        .querySelectorAll("#sidebar nav a[href]")

        .forEach(link => {

            const href = link.getAttribute("href");

            if (

                href &&

                href !== "#" &&

                current.startsWith(href)

            ) {

                link.classList.add(

                    "bg-indigo-50",

                    "text-indigo-700"

                );

            }

        });

}


/* =====================================================
   Current User
===================================================== */

async function loadCurrentUser() {

    let user = Auth.getCurrentUser();

    if (!user) {

        try {

            user =

                await AuthService.fetchCurrentUser();

        }

        catch (error) {

            console.error(error);

            Auth.logout();

            return;

        }

    }

    if (!user)
        return;

    const username =

        user.username ||

        user.name ||

        "User";

    const email =

        user.email ||

        "";

    setText(

        "navUsername",

        username

    );

    setText(

        "navEmail",

        email

    );

    setText(

        "ddUsername",

        username

    );

    setText(

        "ddEmail",

        email

    );

    setText(

        "avatarCircle",

        getInitials(username)

    );

}


/* =====================================================
   Helpers
===================================================== */

function getInitials(name = "") {

    return name

        .trim()

        .split(/\s+/)

        .map(x => x[0])

        .join("")

        .substring(0, 2)

        .toUpperCase();

}

function setText(id, value) {

    const el =

        document.getElementById(id);

    if (el)

        el.textContent = value;

}
