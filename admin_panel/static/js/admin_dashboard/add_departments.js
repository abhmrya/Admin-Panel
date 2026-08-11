/**
 * =====================================================
 * add_departments.js - Department Management Logic
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    fetchDepartments();

    // Event Listeners for Form & Modals
    document.getElementById("departmentForm").addEventListener("submit", handleDepartmentSubmit);
    document.getElementById("openAddModalBtn").addEventListener("click", () => openModal('add'));
    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
});

/**
 * Fetch all departments and render table rows
 */
async function fetchDepartments() {
    try {
        const data = await Api.get(APP_CONFIG.ENDPOINTS.DEPARTMENTS);
        const tbody = document.getElementById("departmentTableBody");
        tbody.innerHTML = "";

        const departments = Array.isArray(data) ? data : (data.results || []);

        if (departments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 text-sm">No departments found.</td></tr>`;
            return;
        }

        departments.forEach(dept => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-gray-50 transition";
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${escapeHtml(dept.name)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600"><code class="bg-gray-100 px-2 py-1 rounded">${escapeHtml(dept.code)}</code></td>
                <td class="px-6 py-4 text-gray-500 max-w-xs truncate">${escapeHtml(dept.description || "-")}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${dept.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${dept.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onclick="editDepartment('${dept.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition">Edit</button>
                    <button onclick="deleteDepartment('${dept.id}')" class="text-red-600 hover:text-red-900 bg-red-50 bg-red-100 px-3 py-1 rounded transition">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading departments:", error);
        showNotification("Failed to load departments: " + error.message, "error");
    }
}

/**
 * Handle Add/Update form submission (POST / PUT)
 */
async function handleDepartmentSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("departmentId").value;
    const payload = {
        name: document.getElementById("name").value.trim(),
        code: document.getElementById("code").value.trim(),
        description: document.getElementById("description").value.trim(),
        is_active: document.getElementById("isActive").checked
    };

    try {
        if (id) {
            // Update existing -> /api/v1/departments/{id}/
            await Api.put(`${APP_CONFIG.ENDPOINTS.DEPARTMENTS}${id}/`, payload);
            showNotification("Department updated successfully!", "success");
        } else {
            // Create new -> /api/v1/departments/ (Handled by standard ModelViewSet)
            await Api.post(APP_CONFIG.ENDPOINTS.DEPARTMENTS, payload);
            showNotification("Department added successfully!", "success");
        }

        closeModal();
        fetchDepartments();
    } catch (error) {
        console.error("Submission error:", error);
        const errorMsg = error.data ? JSON.stringify(error.data) : error.message;
        showNotification("Operation failed: " + errorMsg, "error");
    }
}

/**
 * Load single department data into modal for editing
 */
async function editDepartment(id) {
    try {
        const dept = await Api.get(`${APP_CONFIG.ENDPOINTS.DEPARTMENTS}${id}/`);
        
        document.getElementById("departmentId").value = dept.id;
        document.getElementById("name").value = dept.name;
        document.getElementById("code").value = dept.code;
        document.getElementById("description").value = dept.description || "";
        document.getElementById("isActive").checked = dept.is_active;

        openModal('edit');
    } catch (error) {
        console.error("Error fetching single department:", error);
        showNotification("Could not load details for editing.", "error");
    }
}

/**
 * Delete department record
 */
async function deleteDepartment(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
        await Api.delete(`${APP_CONFIG.ENDPOINTS.DEPARTMENTS}${id}/`);
        showNotification("Department deleted successfully.", "success");
        fetchDepartments();
    } catch (error) {
        console.error("Delete error:", error);
        showNotification("Failed to delete: " + error.message, "error");
    }
}

/**
 * Modal State Functions
 */
function openModal(mode = 'add') {
    const modal = document.getElementById("departmentModal");
    const title = document.getElementById("modalTitle");
    
    if (mode === 'add') {
        document.getElementById("departmentForm").reset();
        document.getElementById("departmentId").value = "";
        document.getElementById("isActive").checked = true;
        title.innerText = "Add Department";
    } else {
        title.innerText = "Edit Department";
    }
    
    modal.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("departmentModal").classList.add("hidden");
}

/**
 * Notification Helper
 */
function showNotification(message, type = "success") {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

/**
 * XSS Security Escape Utility
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}