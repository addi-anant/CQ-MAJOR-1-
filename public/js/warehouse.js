const forwardList = document.getElementById("forward-list");
const approveList = document.getElementById("approve-list");

// EVENT LISTENER ON RECIEVED BUTTON:
document.querySelectorAll(".recieved").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.getAttribute("id");
    const wareHouseNumber = btn.getAttribute("wareHouseNumber");

    // MAKE REQUEST TO BACKEND TO UPDATE STATUS:
    const response = await fetch(`/warehouse/recieve-order-request/${id}`, {
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

    const forwardOrder = `<div class="order-wrapper forward-order-${id}">
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

      <div id="action-wrapper">
        <p for="order-request-${id}">
          <b> Status: </b>
        </p>

        <select
          name="order-request"
          id="order-info-${id}">
          <!--  -->
          ${
            parseInt(wareHouseNumber) === 1
              ? `<option value="4">Forward Order to Warehouse 2.</option>
                 <option value="6">Forward Order to Final Delivery Station.</option>`
              : `<option value="6">Forward Order to Final Delivery Station.</option>`
          }
        </select>
      </div>

      <button class="forward" id="${id}" onclick="forwardOrderHandler(${id})">
        Forward
      </button>
    </div>`;

    response.status === 200 && approveList.removeChild(orderTobeRemovedFromDOM);
    response.status === 200 &&
      forwardList.insertAdjacentHTML("beforeend", forwardOrder);
  });
});

// EVENT LISTENER ON FORWARD BUTTON:
const forwardOrderHandler = async (id) => {
  const status = document.getElementById(`order-info-${id}`)?.value;

  // MAKE REQUEST TO BACKEND TO UPDATE STATUS:
  const response = await fetch(
    `/warehouse/approve-order-request/${status}/${id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  // REMOVE CHILD FROM DOM:
  const orderTobeRemovedFromDOM = document.querySelector(
    `.forward-order-${id}`
  );

  response.status === 200 && forwardList.removeChild(orderTobeRemovedFromDOM);
};

document.querySelectorAll(".forward").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("id");
    forwardOrderHandler(id);
  });
});
