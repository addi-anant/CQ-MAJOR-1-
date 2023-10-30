let limit = document.getElementById("product-count").value;
const cardContainer = document.querySelector(".card-container");
const paginationWrapper = document.querySelector(".pagination-wrapper");
const paginationCounter = document.querySelector("#pagination-counter");

/* Get product Node: */
const addToDOM = function (id, name, imgURL, price) {
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
      </div>

      <div class="button-container">
        <button type="button" class="cart-btn" id="btn-${id}" onclick = addToCart("${id}")  >Add to cart</button>
        <button type="button" class="detail-btn" onclick = viewDetail("${id}")>Detail</button>
      </div>
    </div>
  </div>`;

  cardContainer.insertAdjacentHTML("beforeend", product);
  return product;
};

/* fetch the product from the server and display them to the user: */
const fetchProduct = async (pageNo) => {
  const response = await fetch(`/fetch-product/${pageNo}/${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const productList = await response.json();

  cardContainer.replaceChildren("");
  productList.forEach((product) => {
    addToDOM(product.id, product.name, product.img, product.price);
  });
};
fetchProduct(1);

/* Pagination: */
const addBtn = async () => {
  const response = await fetch(`/page-count/${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const btnCount = await response.json();
  let btnWrapper = "";
  // let btnWrapper = "<div id='pagination-counter'>";
  for (let i = 0; i < parseInt(btnCount?.count); i++)
    btnWrapper += `<div class="number" pageNo="${i + 1}"> ${i + 1} </div>`;
  // btnWrapper += "</div>";

  document.getElementById("pagination-counter")?.replaceChildren("");
  paginationCounter.insertAdjacentHTML("beforeend", btnWrapper);

  document.querySelectorAll(".number")?.forEach((button) => {
    button.addEventListener("click", async () => {
      fetchProduct(button.getAttribute("pageNo"));
    });
  });
};
addBtn();

/* Pagination Count: */
document
  .getElementById("product-count")
  .addEventListener("change", function () {
    limit = this.value;
    fetchProduct(1);
    addBtn();
  });

/* View Modal */
const modalWrapper = document.getElementById("modal");
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

/* Remove Modal */
const removeModal = (val) => {
  cardContainer.classList.remove("opc");
  modalWrapper.removeChild(val.parentNode);
  modalWrapper.classList.remove("modal-wrapper");
};

/* Add to cart handler (:id) */
const addToCart = async (id) => {
  const response = await fetch(`/user/add-product-cart/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.status === 401) {
    window.location.replace("/auth/login");
  }

  if ((response.status = 200)) {
    const btn = document.getElementById(`btn-${id}`);
    btn.innerHTML = `<i class="fa-solid fa-check fa-btn"></i>`;

    setTimeout(() => {
      btn.innerHTML = "Add to Cart";
    }, 2000);
  }
};
