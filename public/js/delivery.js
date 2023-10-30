const approveList = document.getElementById("approve-list");
const outForDeliveryList = document.getElementById("out-for-delivery-list");

// EVENT LISTENER ON RECIEVED BUTTON:
document.querySelectorAll(".recieved").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.getAttribute("id");

    // MAKE REQUEST TO BACKEND TO UPDATE STATUS:
    const response = await fetch(`/delivery/recieve-order-request/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // REMOVE CHILD FROM DOM:
    const orderTobeRemovedFromDOM = document.querySelector(
      `.recieved-product-${id}`
    );

    const orderId =
      orderTobeRemovedFromDOM.children[0].children[0].innerText.split(":")[1];

    const name =
      orderTobeRemovedFromDOM.children[1].children[0].innerText.split(":")[1];

    const phone =
      orderTobeRemovedFromDOM.children[2].children[0].innerText.split(":")[1];

    const shippingAddress =
      orderTobeRemovedFromDOM.children[3].children[0].innerText.split(":")[1];

    const outForDeliveryProduct = `<div class="order-wrapper forward-order-${id}">
      <div class="order-info">
        <p><b>ORDER ID:</b>${orderId}</p>
      </div>

      <div class="order-info">
        <p><b>Name:</b> ${name} </p>
      </div>

      <div class="order-info">
        <p><b>Phone:</b> ${phone} </p>
      </div>

      <div class="order-info">
        <p><b>Shipping Address:</b> ${shippingAddress} </p>
      </div>

      <div class="order-info">
        <p><b>Mode of Payment:</b>CASH</p>
      </div>

      <button class="outForDelivery" id="${id}" onclick="outForDeliveryHandler(${id})">
        Out For Delivery
      </button>
    </div>`;

    response.status === 200 && approveList.removeChild(orderTobeRemovedFromDOM);
    response.status === 200 &&
      outForDeliveryList.insertAdjacentHTML("beforeend", outForDeliveryProduct);
  });
});

// EVENT LISTENER ON OUT FOR DELIVERY BUTTON:
const outForDeliveryHandler = async (id) => {
  // MAKE REQUEST TO BACKEND TO UPDATE STATUS:
  const response = await fetch(`/delivery/out-for-delivery-request/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // REMOVE CHILD FROM DOM:
  const orderTobeRemovedFromDOM = document.querySelector(
    `.forward-order-${id}`
  );

  response.status === 200 &&
    outForDeliveryList.removeChild(orderTobeRemovedFromDOM);
};

document.querySelectorAll(".outForDelivery").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("id");
    outForDeliveryHandler(id);
  });
});
