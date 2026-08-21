document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const errorBox = document.getElementById("registerError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      username: form.username.value,
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        window.location.href = "/login/";
      } else {
        errorBox.textContent = resData?.detail || "Registration failed";
        errorBox.classList.remove("hidden");
      }
    } catch (err) {
      errorBox.textContent = "Something went wrong!";
      errorBox.classList.remove("hidden");
    }
  });
});

