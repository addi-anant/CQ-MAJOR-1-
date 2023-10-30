/* Logout Functionality: */
document.getElementById("logout")?.addEventListener("click", async () => {
  await fetch("/auth/logout");
  window.location.replace("/auth/login");
});

/* Reset Password Functionality: */
document.getElementById("password")?.addEventListener("click", async () => {
  window.location.replace("/auth/reset-password");
});

/* Seller Functionality: */
document.getElementById("seller")?.addEventListener("click", async () => {
  window.location.replace("/seller");
});

/* Admin Functionality: */
document.getElementById("admin")?.addEventListener("click", async () => {
  window.location.replace("/admin");
});
