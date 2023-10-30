const modalWrapper = document.getElementById("modal");
const cardContainer = document.querySelector(".card-container");

/* fetch all the todo from the server and display them to the user: */
const fetchCartProduct = async () => {
  const response = await fetch(`/user/fetch-cart-product`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const productList = await response.json();

  productList?.forEach((product) => {
    addToDOM(
      product?.id,
      product?.name,
      product?.img,
      product?.price,
      product?.quantity
    );
  });
};
fetchCartProduct();

/* Add Individual Product to DOM: */
const addToDOM = function (id, name, imgURL, price, qty) {
  const product = `<div class="card" product_id=${id}>
    <div class="card-top">
      <img src=${imgURL} />
    </div>
    <div class="card-lower">
      <div class="card-detail">
        <p class="name">${name}</p>
        <p class="cost">
          <i class="fa-solid fa-indian-rupee-sign"></i>
          ${price}
        </p>
        <div class="quantity-container">
          <p class="quantity heading">Quantity:</p>
          <p class="quantity qty">${qty}</p>
          <button type="button" class="quantity-btn" onclick="increaseQuantity('${id}', this)" >
          
            <i class="fa-solid fa-plus"></i>
          </button>
          <button type="button" class="quantity-btn" onclick="decreaseQuantity('${id}', this)" >
            <i class="fa-solid fa-minus"></i>
          </button>
        </div>
      </div>

      <div class="button-container">
        <button type="button" class="delete-btn" onclick="deleteProduct('${id}', this)" >Delete</button>
        <button type="button" class="detail-btn" onclick = viewDetail("${id}")>Detail</button>
      </div>
    </div>`;

  cardContainer.insertAdjacentHTML("beforeend", product);
};

/* View Individual Product Detail in Modal: */
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
  cardContainer.classList.add("opc");
  modalWrapper.classList.add("modal-wrapper");
  modalWrapper.insertAdjacentHTML("beforeend", modal);
};

/* Remove Modal from DOM Modal: */
const removeModal = (val) => {
  cardContainer.classList.remove("opc");
  modalWrapper.removeChild(val.parentNode);
  modalWrapper.classList.remove("modal-wrapper");
};

/* Delete product: */
const deleteProduct = async (id, val) => {
  const response = await fetch(`/user/delete-product/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  /* Removing product from DOM: */
  const product = val.parentNode.parentNode.parentNode;
  response.status === 200 && cardContainer.removeChild(product);
};

/* increase product Quantity: */
const increaseQuantity = async (id, val) => {
  const response = await fetch(`/user/increase-quantity/${id}`, {
    method: "POST",
    body: JSON.stringify({
      qty: parseInt(val.parentNode.children[1].innerText),
    }),
    headers: { "Content-Type": "application/json" },
  });

  /* Maximum Stock Quantity Reached: */
  if (response.status === 400) {
    console.log("Maximum Stock Quantity reached!");
    return;
  }

  /* Increase Quantity in DOM: */
  response.status === 200 &&
    (val.parentNode.children[1].innerText =
      parseInt(val.parentNode.children[1].innerText) + 1);
};

/* decrease product Quantity: */
const decreaseQuantity = async (id, val) => {
  /* can't reduce Quantity lesser than 1: */
  if (parseInt(val.parentNode.children[1].innerText) === 1) return;

  const response = await fetch(`/user/decrease-quantity/${id}`, {
    method: "POST",
    body: JSON.stringify({
      qty: parseInt(val.parentNode.children[1].innerText),
    }),
    headers: { "Content-Type": "application/json" },
  });

  /* Maximum Stock Quantity Reached: */
  if (response.status === 400) {
    console.log("Maximum Stock Quantity reached!");
    return;
  }

  /* Decrease Quantity in DOM: */
  response.status === 200 &&
    (val.parentNode.children[1].innerText =
      parseInt(val.parentNode.children[1].innerText) - 1);
};
