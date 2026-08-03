// document.addEventListener("DOMContentLoaded", init);

// const searchInput = document.getElementById("searchInput");
// const roleFilter = document.getElementById("roleFilter");
// const statusFilter = document.getElementById("statusFilter");

// const refreshBtn = document.getElementById("refreshBtn");
// const resetBtn = document.getElementById("resetBtn");

// const tableBody = document.getElementById("usersTable");
// const emptyState = document.getElementById("emptyState");

// const pagination = document.getElementById("pagination");
// const paginationInfo = document.getElementById("paginationInfo");

// let currentPage = 1;
// let currentResponse = null;

// function init() {

//     bindEvents();

//     loadUsers();

// }

// function renderTable(users) {

//     tableBody.innerHTML = "";

//     if (!users.length) {

//         emptyState.classList.remove("hidden");

//         return;

//     }

//     emptyState.classList.add("hidden");

//     users.forEach(user => {

//         tableBody.insertAdjacentHTML(

//             "beforeend",

//             userRow(user)

//         );

//     });

// }


// function userRow(user) {

//     return `

// <tr class="hover:bg-slate-50 transition">

//     <td class="px-5 py-4">

//         <div class="font-semibold text-slate-800">

//             ${user.username}

//         </div>

//     </td>

//     <td class="px-5 py-4">

//         ${user.first_name}

//     </td>

//     <td class="px-5 py-4 text-slate-600">

//         ${user.email}

//     </td>

//     <td class="px-5 py-4">

//         ${roleBadge(user.role)}

//     </td>

//     <td class="px-5 py-4">

//         ${statusBadge(user.is_active)}

//     </td>

//     <td class="px-5 py-4 text-slate-500">

//         ${formatDate(user.created_at)}

//     </td>

//     <td class="px-5 py-4 text-center">

//         <button

//             class="actionBtn text-xl"

//             data-id="${user.id}"

//         >

//             ⋮

//         </button>

//     </td>

// </tr>

// `;

// }



// function roleBadge(role) {

//     const colors = {

//         ADMIN: "bg-red-100 text-red-700",

//         HR: "bg-blue-100 text-blue-700",

//         MANAGER: "bg-yellow-100 text-yellow-700",

//         EMPLOYEE: "bg-green-100 text-green-700"

//     };

//     return `

// <span class="px-3 py-1 text-xs font-semibold ${colors[role] || "bg-slate-100"}">

//     ${role}

// </span>

// `;

// }


// function statusBadge(active) {

//     return active

//         ?

// `<span class="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">

// Active

// </span>`

//         :

// `<span class="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700">

// Inactive

// </span>`;

// }


// function formatDate(date) {

//     return new Date(date)

//         .toLocaleDateString(

//             "en-IN",

//             {

//                 day: "2-digit",

//                 month: "short",

//                 year: "numeric"

//             }

//         );

// }

// function renderPagination(data) {

//     pagination.innerHTML = "";

//     const totalPages = Math.ceil(data.count / 10);

//     if (totalPages <= 1) {

//         paginationInfo.textContent = `Showing ${data.results.length} of ${data.count} users`;

//         return;

//     }

//     paginationInfo.textContent = `Total ${data.count} Users`;

//     pagination.appendChild(createPageButton("Previous", currentPage - 1, currentPage === 1));

//     for (let page = 1; page <= totalPages; page++) {

//         const button = createPageButton(page, page, false);

//         if (page === currentPage) {

//             button.classList.add("bg-indigo-600", "text-white");

//         }

//         pagination.appendChild(button);

//     }

//     pagination.appendChild(createPageButton("Next", currentPage + 1, currentPage === totalPages));

// }


// function createPageButton(text, page, disabled) {

//     const button = document.createElement("button");

//     button.textContent = text;

//     button.disabled = disabled;

//     button.className =
//         "px-3 py-2 border border-slate-300 hover:bg-slate-100 disabled:opacity-50";

//     button.onclick = () => {

//         currentPage = page;

//         loadUsers();

//     };

//     return button;

// }



// <td class="px-5 py-4 text-center">

//     <button

//         class="actionBtn"

//         data-id="${user.id}"

//     >

//         ⋮

//     </button>

// </td>

// document.addEventListener("click", handleActionMenu);

// function handleActionMenu(event) {

//     const button = event.target.closest(".actionBtn");

//     closeActionMenu();

//     if (!button) {
//         return;
//     }

//     event.stopPropagation();

//     const menu = document.createElement("div");

//     menu.id = "actionMenu";

//     menu.className =
//         "absolute bg-white border border-slate-200 shadow-lg w-48 z-50";

//     menu.innerHTML = `

// <button class="menu-item viewUser" data-id="${button.dataset.id}">
//     👁 View
// </button>

// <button class="menu-item editUser" data-id="${button.dataset.id}">
//     ✏ Edit
// </button>

// <button class="menu-item toggleUser" data-id="${button.dataset.id}">
//     🔄 Activate / Deactivate
// </button>

// <button class="menu-item deleteUser text-red-600" data-id="${button.dataset.id}">
//     🗑 Delete
// </button>

// `;

//     button.parentElement.style.position = "relative";

//     button.parentElement.appendChild(menu);

//     bindActionEvents();

// }

// function closeActionMenu() {

//     document.getElementById("actionMenu")?.remove();

// }


// function bindActionEvents() {

//     document.querySelector(".viewUser")?.addEventListener("click", viewUser);

//     document.querySelector(".editUser")?.addEventListener("click", editUser);

//     document.querySelector(".toggleUser")?.addEventListener("click", toggleUser);

//     document.querySelector(".deleteUser")?.addEventListener("click", deleteUser);

// }


// function viewUser(event) {

//     const id = event.currentTarget.dataset.id;

//     window.location.href = `/users/${id}/`;

// }

// function editUser(event) {

//     const id = event.currentTarget.dataset.id;

//     window.location.href = `/users/${id}/edit/`;

// }

// async function toggleUser(event) {

//     const id = event.currentTarget.dataset.id;

//     console.log(id);

// }

// async function deleteUser(event) {

//     const id = event.currentTarget.dataset.id;

//     console.log(id);

// }










// static/js/users/list.js

document.addEventListener("DOMContentLoaded", () => {

    const usersTable = document.getElementById("usersTable");
    const paginationInfo = document.getElementById("paginationInfo");
    const pagination = document.getElementById("pagination");
    const searchInput = document.getElementById("searchInput");
    const roleFilter = document.getElementById("roleFilter");
    const statusFilter = document.getElementById("statusFilter");
    const resetFilters = document.getElementById("resetFilters");

    const API_URL = "/api/v1/users/"; // apna actual endpoint yaha daal dena

    let currentPage = 1;
    let searchTimer = null;

    // Role -> badge color mapping (4 alag colors)
    const ROLE_STYLES = {
        ADMIN: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
        HR: "bg-pink-50 text-pink-700 ring-1 ring-pink-200",
        MANAGER: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        EMPLOYEE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };

    const AVATAR_COLORS = [
        "bg-slate-800", "bg-indigo-600", "bg-rose-600",
        "bg-amber-600", "bg-teal-600", "bg-cyan-600",
    ];

    function getInitials(first, last, username) {
        const f = (first || "").trim();
        const l = (last || "").trim();
        if (f || l) {
            return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || username.charAt(0).toUpperCase();
        }
        return username.charAt(0).toUpperCase();
    }

    function avatarColorFor(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function roleBadge(role) {
        const style = ROLE_STYLES[role] || "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
        return `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}">
                ${role}
            </span>
        `;
    }

    function statusBadge(isActive) {
        if (isActive) {
            return `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Active
                </span>
            `;
        }
        return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Inactive
            </span>
        `;
    }

    function renderRow(user) {
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "-";
        const initials = getInitials(user.first_name, user.last_name, user.username);
        const avatarColor = avatarColorFor(user.username);

        return `
            <tr class="hover:bg-gray-50 transition">

                <td class="px-5 py-3">
                    <input type="checkbox" class="rounded border-gray-300" data-id="${user.id}">
                </td>

                <td class="px-5 py-3 font-medium text-gray-900">
                    ${user.username}
                </td>

                <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full ${avatarColor} text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            ${initials}
                        </div>
                        <span class="text-gray-700">${fullName}</span>
                    </div>
                </td>

                <td class="px-5 py-3 text-gray-500">
                    ${user.email}
                </td>

                <td class="px-5 py-3">
                    ${roleBadge(user.role)}
                </td>

                <td class="px-5 py-3">
                    ${statusBadge(user.is_active)}
                </td>

                <td class="px-5 py-3 text-gray-500">
                    ${formatDate(user.created_at)}
                </td>

                <td class="px-5 py-3">
                    <div class="flex items-center justify-center gap-1">

                        <button
                            class="p-2 rounded-lg text-gray-500 hover:text-slate-900 hover:bg-gray-100 transition"
                            title="Edit"
                            data-action="edit"
                            data-id="${user.id}"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>

                        <button
                            class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                            data-action="delete"
                            data-id="${user.id}"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }

    function renderEmptyState() {
        usersTable.innerHTML = `
            <tr>
                <td colspan="8" class="py-16 text-center text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3a4 4 0 10-4-4 4 4 0 004 4zm6 4v-2a4 4 0 00-3-3.87"/>
                        </svg>
                        No users found
                    </div>
                </td>
            </tr>
        `;
    }

    function renderLoading() {
        usersTable.innerHTML = `
            <tr>
                <td colspan="8" class="py-20 text-center text-gray-400">
                    Loading Users...
                </td>
            </tr>
        `;
    }

    function renderPagination(count, page, pageSize) {
        const totalPages = Math.max(1, Math.ceil(count / pageSize));
        pagination.innerHTML = "";

        const makeBtn = (label, targetPage, disabled = false, active = false) => {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.disabled = disabled;
            btn.className = `
                px-3 py-1.5 text-sm rounded-lg border transition
                ${active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"}
                ${disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}
            `;
            btn.addEventListener("click", () => {
                if (!disabled) {
                    currentPage = targetPage;
                    fetchUsers();
                }
            });
            return btn;
        };

        pagination.appendChild(makeBtn("Prev", page - 1, page <= 1));

        for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(makeBtn(i, i, false, i === page));
        }

        pagination.appendChild(makeBtn("Next", page + 1, page >= totalPages));
    }

    async function fetchUsers() {
        renderLoading();

        const params = new URLSearchParams({
            page: currentPage,
            search: searchInput.value.trim(),
            role: roleFilter.value,
            is_active: statusFilter.value,
        });

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`);
            const data = await response.json();

            const results = data.results || [];
            const count = data.count || 0;
            const pageSize = results.length || 10;

            if (results.length === 0) {
                renderEmptyState();
            } else {
                usersTable.innerHTML = results.map(renderRow).join("");
            }

            paginationInfo.textContent = `Showing ${results.length} of ${count} users`;
            renderPagination(count, currentPage, pageSize);

        } catch (error) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="8" class="py-16 text-center text-red-500">
                        Failed to load users. Please try again.
                    </td>
                </tr>
            `;
            console.error("Error fetching users:", error);
        }
    }

    // Search with debounce
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentPage = 1;
            fetchUsers();
        }, 400);
    });

    roleFilter.addEventListener("change", () => {
        currentPage = 1;
        fetchUsers();
    });

    statusFilter.addEventListener("change", () => {
        currentPage = 1;
        fetchUsers();
    });

    resetFilters.addEventListener("click", () => {
        searchInput.value = "";
        roleFilter.value = "";
        statusFilter.value = "";
        currentPage = 1;
        fetchUsers();
    });

    // Row action buttons (edit / delete)
    usersTable.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === "edit") {
            window.location.href = `/dashboard/users/${id}/edit/`;
        } else if (action === "delete") {
            if (confirm("Are you sure you want to delete this user?")) {
                // apna delete API call yaha likhna
                console.log("Delete user:", id);
            }
        }
    });

    fetchUsers();
});