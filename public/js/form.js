const clientInfo = document.getElementById("client-info");
const clientError = document.getElementById("client-error");

/* Login Handler: */
document.getElementById("login-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
    headers: { "Content-Type": "application/json" },
  });

  response.status === 200 && window.location.replace("/");
  response.status === 206 && window.location.replace("/admin");
  response.status === 204 && window.location.replace("/delivery");
  response.status === 201 && window.location.replace("/warehouse");

  clientError.innerText =
    response.status === 400
      ? "All Fields are required"
      : response.status === 401
      ? "Email Not Verified"
      : response.status === 404
      ? "Invalid username or password"
      : "";
});

/* Register handler: */
document.getElementById("register-btn")?.addEventListener("click", async () => {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch(`/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name: name, email: email, password: password }),
    headers: { "Content-Type": "application/json" },
  });

  clientInfo.innerText =
    response.status === 200
      ? "Link sent for verification, Check Your Email!"
      : "";

  clientError.innerText =
    response.status === 400
      ? "All Fields are required"
      : response.status === 401
      ? "Email Already in use."
      : response.status === 406
      ? "Invalid Password, Follow Password Containts."
      : "";
});

/* Forgot Password Handler: */
document.getElementById("update-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("update-email").value;

  const response = await fetch(`/auth/update-password`, {
    method: "POST",
    body: JSON.stringify({ email: email }),
    headers: { "Content-Type": "application/json" },
  });

  clientInfo.innerText =
    response.status === 200
      ? "Link to update your password sent, Check Your Email!"
      : "";

  clientError.innerText =
    response.status === 400
      ? "All Fields are required"
      : response.status === 404
      ? "No user with provided Email Found."
      : "";
});

/* New Password Handler: */
const token = window.location.href.split("/")[5]; // token.
document.getElementById("new-btn")?.addEventListener("click", async () => {
  const password = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("new-confirmPassword").value;

  const response = await fetch(`/auth/new-password/${token}`, {
    method: "POST",
    body: JSON.stringify({
      password: password,
      confirmPassword: confirmPassword,
    }),
    headers: { "Content-Type": "application/json" },
  });

  response.status === 500 && window.location.replace("/auth/invalid-token");

  clientError.innerText =
    response.status === 400
      ? "All Fields are required"
      : response.status === 409
      ? "Passwords donot match."
      : response.status === 406
      ? "Invalid Password, Follow Password Containts."
      : "";

  clientInfo.innerText =
    response.status === 200
      ? "Your password has been updated successfully, you will be redirected shortly!"
      : "";

  response.status === 200 &&
    setTimeout(() => {
      window.location.replace("/auth/login");
    }, 4000);
});

/* Order Product Handler: */
document
  .getElementById("order-btn")
  ?.addEventListener("click", async (event) => {
    event.preventDefault();

    const name = document.getElementById("user-name").value;
    const phone = document.getElementById("user-phone").value;
    const address = document.getElementById("user-address").value;

    const response = await fetch(`/user/order-product`, {
      method: "POST",
      body: JSON.stringify({ name: name, phone: phone, address: address }),
      headers: { "Content-Type": "application/json" },
    });

    response.status === 200 && window.location.replace("/user/order-success");

    document.getElementById("checkoutErrorMessage").innerText =
      response.status === 400
        ? "All Fields are required."
        : response.status === 403
        ? "Phone Number must have 10 digits."
        : "";
  });

/* SELLER Login Handler: */
document
  .getElementById("seller-login-btn")
  ?.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch(`/auth/seller-login`, {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
      headers: { "Content-Type": "application/json" },
    });

    response.status === 200 && window.location.replace("/seller");

    clientError.innerText =
      response.status === 400
        ? "All Fields are required"
        : response.status === 401
        ? "Email Not Verified"
        : response.status === 404
        ? "Invalid username or password"
        : "";
  });

/* SELLER Register handler: */
document
  .getElementById("seller-register-btn")
  ?.addEventListener("click", async () => {
    /* Create Form-data: */
    const formData = new FormData();
    formData.append("name", document.getElementById("register-name").value);
    formData.append("email", document.getElementById("register-email").value);
    formData.append(
      "password",
      document.getElementById("register-password").value
    );
    formData.append("phone", document.getElementById("register-phone").value);
    formData.append(
      "company",
      document.getElementById("register-company").value
    );
    formData.append("file", document.getElementById("register-gst").files[0]);

    /* Add Product to DB: */
    const response = await fetch(`/auth/seller-register`, {
      method: "POST",
      body: formData,
    });

    clientInfo.innerText =
      response.status === 200
        ? "Link sent for verification, Check Your Email!"
        : "";

    clientError.innerText =
      response.status === 400
        ? "All Fields are required"
        : response.status === 401
        ? "Email Already in use."
        : response.status === 406
        ? "Invalid Password, Follow Password Containts."
        : "";
  });
