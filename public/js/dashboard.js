/* Cancel Button: */
document.querySelectorAll(".cancel-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const orderID = btn.getAttribute("id")?.split("-")[1];

    const response = await fetch(`/user/cancel-order/${orderID}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      document.getElementById(`status-${orderID}`).innerText = "Cancelled";
      document.getElementById(`cancel-${orderID}`).innerText = "Cancelled";
    }
  });
});

/* View Product Modal: */
const modalWrapper = document.getElementById("order-modal");
const viewDetail = async (id) => {
  const response = await fetch(`/product/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const product = await response.json();

  const modal = `<div class="modal-outer">
    <i class="fa-solid fa-xmark close" onclick="removeModal(this)"></i>
    <div class="left">
      <img src="${product?.img}" alt="" />
    </div>
    <div class="right">
      <p class="heading">${product?.name}</p>
      <p class="cost">
        <i class="fa-solid fa-indian-rupee-sign"></i>
        ${product?.price}
      </p>
      <p class="description">${product?.description}</p>
    </div>
  </div>`;

  // append a modal.
  modalWrapper.classList.add("modal-wrapper");
  modalWrapper.insertAdjacentHTML("beforeend", modal);

  document.getElementsByClassName("user-info")[0].classList.add("opc");
  document.getElementsByClassName("order-info")[0].classList.add("opc");
};

/* Order Tracking Modal: */
const orderWrapper = document.getElementById("timeline-modal");
const orderTracking = async (orderID) => {
  const response = await fetch(`/user/track-order/${orderID}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const statusCode = await response.json();

  const modal = `<div class="timeline timeline-modal-outer">
      <i class="fa-solid fa-xmark close" onclick="removeOrderModal(this)"></i>
      
      <div class="container right">
        <div class="content">
          <h3>Preparing for Dispatch.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order Dispatched For Warehouse 1.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order Recieved at warehouse 1.</h3>
        </div>
      </div>
      
      <div class="container right">
        <div class="content">
          <h3>Order Dispatched For Warehouse 2.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order Recieved at warehouse 2.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order Dispatched For Final Delivery Station.</h3>
        </div>
      </div>
      
      <div class="container right">
        <div class="content">
          <h3>Order Recieved at final delivery station.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order out for delivery.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order successfully Delivered.</h3>
        </div>
      </div>

      <div class="container right">
        <div class="content">
          <h3>Order Cancelled.</h3>
        </div>
      </div>
    </div>`;

  // Append Modal:
  orderWrapper.classList.add("modal-wrapper");
  orderWrapper.insertAdjacentHTML("beforeend", modal);

  document.getElementsByClassName("user-info")[0].classList.add("opc");
  document.getElementsByClassName("order-info")[0].classList.add("opc");

  statusCode.statusCode === 0
    ? orderWrapper.children[0].children[10].style.setProperty(
        "background-color",
        "#FFFB73"
      )
    : orderWrapper.children[0].children[
        statusCode.statusCode
      ].style.setProperty("background-color", "#FFFB73");
};

/* Remove Modal */
const removeModal = (val) => {
  modalWrapper.classList.remove("modal-wrapper");
  modalWrapper.removeChild(val.parentNode);

  document.getElementsByClassName("user-info")[0].classList.remove("opc");
  document.getElementsByClassName("order-info")[0].classList.remove("opc");
};

/* Remove Order Modal */
const removeOrderModal = (val) => {
  orderWrapper.removeChild(val.parentNode);
  orderWrapper.classList.remove("modal-wrapper");

  document.getElementsByClassName("user-info")[0].classList.remove("opc");
  document.getElementsByClassName("order-info")[0].classList.remove("opc");
};

/* View Product Button: */
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const productID = btn.getAttribute("id")?.split("-")[1];
    viewDetail(productID);
  });
});

/* Update Avatar handler: */
document.getElementById("avatar").onchange = async () => {
  const file = document.getElementById("avatar").files[0];

  /* Create Form-data: */
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/user/update-avatar", {
    method: "POST",
    body: formData,
  });

  response.status === 200 &&
    document
      .getElementById("avatarPic")
      .setAttribute("src", URL.createObjectURL(file));
};

/* View Product Button: */
document.querySelectorAll(".track-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const orderID = btn.getAttribute("id")?.split("-")[1];
    orderTracking(orderID);
  });
});
