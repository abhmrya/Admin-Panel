/**
 * =====================================================
 * users.js
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const usersTable = document.getElementById("usersTable");
    const pagination = document.getElementById("pagination");
    const paginationInfo = document.getElementById("paginationInfo");

    const searchInput = document.getElementById("searchInput");
    const roleFilter = document.getElementById("roleFilter");
    const statusFilter = document.getElementById("statusFilter");
    const resetFilters = document.getElementById("resetFilters");

    const state = {
        page: 1,
        search: "",
        role: "",
        status: "",
        debounce: null,
    };

    const ROLE_CLASSES = {
        ADMIN: "bg-purple-100 text-purple-700",
        HR: "bg-pink-100 text-pink-700",
        MANAGER: "bg-blue-100 text-blue-700",
        EMPLOYEE: "bg-green-100 text-green-700",
    };

    const AVATAR_COLORS = [
        "bg-slate-700",
        "bg-indigo-600",
        "bg-emerald-600",
        "bg-rose-600",
        "bg-cyan-600",
        "bg-amber-600",
    ];

    function getInitials(user) {

        const first = user.first_name || "";
        const last = user.last_name || "";

        if (first || last) {
            return (first.charAt(0) + last.charAt(0)).toUpperCase();
        }

        return user.username.charAt(0).toUpperCase();

    }

    function avatarColor(username) {

        let hash = 0;

        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

    }

    function formatDate(date) {

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    }

    function roleBadge(role) {

        return `
            <span class="rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_CLASSES[role] || "bg-gray-100 text-gray-600"}">
                ${role}
            </span>
        `;

    }

    function statusBadge(active) {

        return active
            ? `
            <span class="inline-flex items-center gap-2 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                Active
            </span>
            `
            : `
            <span class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <span class="h-2 w-2 rounded-full bg-gray-400"></span>
                Inactive
            </span>
            `;

    }

        function renderLoading() {

        usersTable.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-16 text-center text-gray-400">
                    Loading users...
                </td>
            </tr>
        `;

    }


    function renderEmpty() {

        usersTable.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-16 text-center text-gray-400">
                    No users found.
                </td>
            </tr>
        `;

    }


    function renderRow(user) {

        const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`.trim() || "-";

        return `

        <tr class="hover:bg-gray-50 transition">

            <td class="px-6 py-4">

                <input
                    type="checkbox"
                    class="rounded border-gray-300">

            </td>

            <td class="px-6 py-4 font-medium text-gray-900">

                ${user.username}

            </td>

            <td class="px-6 py-4">

                <div class="flex items-center gap-3">

                    <div class="flex h-9 w-9 items-center justify-center rounded-full ${avatarColor(user.username)} text-xs font-semibold text-white">

                        ${getInitials(user)}

                    </div>

                    <span>

                        ${fullName}

                    </span>

                </div>

            </td>

            <td class="px-6 py-4 text-gray-600">

                ${user.email}

            </td>

            <td class="px-6 py-4">

                ${roleBadge(user.role)}

            </td>

            <td class="px-6 py-4 text-gray-600">

    ${
        user.department?.name
            ? `
                <div>
                    <p class="font-medium text-gray-800">
                        ${user.department.name}
                    </p>

                    <p class="text-xs text-gray-400">
                        ${user.department.code || ""}
                    </p>
                </div>
            `
            : `
                <span class="text-gray-400">
                    No Department
                </span>
            `
    }

</td>

            <td class="px-6 py-4">

                ${statusBadge(user.is_active)}

            </td>

            <td class="px-6 py-4 text-gray-500">

                ${formatDate(user.created_at)}

            </td>

            <td class="px-6 py-4 text-center">

                <button
                    class="editUser rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    data-id="${user.id}">

                    Edit

                </button>

            </td>

        </tr>

        `;

    }


    function renderTable(data) {

        console.log("USER DATA:", data);

        if (!data.results.length) {

            renderEmpty();

            return;

        }

        usersTable.innerHTML =
            data.results
                .map(renderRow)
                .join("");

        paginationInfo.textContent =
            `Showing ${data.results.length} of ${data.count} users`;

    }


    async function loadUsers() {

        renderLoading();

        const params = new URLSearchParams({

            page: state.page,

            search: state.search,

            role: state.role,

            is_active: state.status,

        });

        try {

            const data =
                await UserService.list(
                    params.toString()
                );

            renderTable(data);

            renderPagination(data);

        }

        catch (error) {

            console.error(error);

            Alerts.show(
                error.message || "Failed to load users."
            );

            renderEmpty();

        }

    }

        function renderPagination(data) {

        pagination.innerHTML = "";

        const pageSize = data.results.length || 10;
        const totalPages = Math.ceil(data.count / pageSize);

        if (totalPages <= 1)
            return;

        const createButton = (label, page, disabled = false, active = false) => {

            return `
                <button
                    class="pageBtn rounded-lg border px-3 py-2 text-sm transition
                    ${active ? "bg-slate-900 border-slate-900 text-white" : "hover:bg-gray-100"}
                    ${disabled ? "cursor-not-allowed opacity-50" : ""}"
                    data-page="${page}"
                    ${disabled ? "disabled" : ""}>
                    ${label}
                </button>
            `;

        };

        let html = "";

        html += createButton(
            "Previous",
            state.page - 1,
            state.page === 1
        );

        for (let i = 1; i <= totalPages; i++) {

            html += createButton(
                i,
                i,
                false,
                i === state.page
            );

        }

        html += createButton(
            "Next",
            state.page + 1,
            state.page === totalPages
        );

        pagination.innerHTML = html;

    }


    searchInput.addEventListener("input", () => {

        clearTimeout(state.debounce);

        state.debounce = setTimeout(() => {

            state.search = searchInput.value.trim();
            state.page = 1;

            loadUsers();

        }, 400);

    });


    roleFilter.addEventListener("change", () => {

        state.role = roleFilter.value;
        state.page = 1;

        loadUsers();

    });


    statusFilter.addEventListener("change", () => {

        state.status = statusFilter.value;
        state.page = 1;

        loadUsers();

    });


    resetFilters.addEventListener("click", () => {

        searchInput.value = "";
        roleFilter.value = "";
        statusFilter.value = "";

        state.search = "";
        state.role = "";
        state.status = "";
        state.page = 1;

        loadUsers();

    });


    pagination.addEventListener("click", e => {

        const button = e.target.closest(".pageBtn");

        if (!button)
            return;

        state.page = Number(button.dataset.page);

        loadUsers();

    });


/*
|--------------------------------------------------------------------------
| Edit User
|--------------------------------------------------------------------------
*/

document.addEventListener("click", async (e) => {

    const button = e.target.closest(".editUser");

    if (!button)
        return;

    try {

        const user =
            await UserUpdateService.retrieve(
                button.dataset.id
            );

        UserUpdate.open(user);

    }

    catch (error) {

        Alerts.show(
            error.message
        );

    }

});


    loadUsers();
    window.loadUsers = loadUsers;

});


