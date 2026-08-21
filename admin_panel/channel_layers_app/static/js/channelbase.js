document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // Helper to decode JWT and get payload
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Auto logout if token expired
  function scheduleAutoLogout() {
    const access = localStorage.getItem("access");
    if (!access) return;

    const payload = parseJwt(access);
    if (!payload || !payload.exp) return;

    const expiryTime = payload.exp * 1000; // JWT exp is in seconds
    const now = Date.now();
    const timeout = expiryTime - now;

    if (timeout <= 0) {
      logout(); // already expired
    } else {
      setTimeout(() => {
        logout();
      }, timeout);
    }
  }

  // Logout function
  async function logout() {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    try {
      if (refresh) {
        await fetch("/api/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(access && { Authorization: `Bearer ${access}` }),
          },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login/";
    }
  }

  // Attach logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      logout();
    });
  }

  // Schedule auto logout
  scheduleAutoLogout();
});
