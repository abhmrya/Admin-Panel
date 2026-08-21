document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      username: loginForm.username.value,
      password: loginForm.password.value,
    };
    console.log(username)
    console.log(password)

    try {
      const res = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        // Adjust depending on your API response
        localStorage.setItem("access", resData.access || resData.tokens?.access);
        localStorage.setItem("refresh", resData.refresh || resData.tokens?.refresh);

        // Redirect to index page
       window.location.href = "{% url 'index' %}";

      } else {
        loginError.textContent = resData?.detail || "Invalid login";
        loginError.classList.remove("hidden");
      }
    } catch (err) {
      loginError.textContent = "Something went wrong!";
      loginError.classList.remove("hidden");
    }
  });
});
