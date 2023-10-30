const clientInfo = document?.getElementById("client-info");
const clientError = document?.getElementById("client-error");
const cardContainer = document?.querySelector(".card-container");
const inActiveCardContainer = document?.querySelector(
  ".inActive-card-container"
);

/* Fetch Product: */
const fetchAdminProduct = async () => {
  const response = await fetch(`/seller/fetch-seller-product`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const products = await response.json();

  products?.forEach((product) => {
    addToDOM(
      product?.id,
      product?.name,
      product?.img,
      product?.price,
      product?.stock,
      product?.description,
      product?.category
    );
  });
};
fetchAdminProduct();

/* Add Individual Product to DOM: */
const addToDOM = function (
  id,
  name,
  imgURL,
  price,
  qty,
  description,
  category
) {
  const product = `<div class="card productCard-${id}">
        <!-- Product Img: -->
        <div class="card-top">
        <img id="img-${id}" src=${imgURL} />
        </div>
        <div class="card-lower">
        <!-- Edit Form: -->
        <div class="card-detail">
          <form>
            <div class="form-field">
              <label for="name" class="label"> Name: </label>
              <input
              required
              autocomplete="off"
              type="text"
              id="edit-name"
              name="name"
              placeholder="Product Name"
              value="${name}"
              class="input" />
            </div>
        
            <div class="form-field">
              <label for="description" class="label">
              Description:
              </label>
              <input
              required
              autocomplete="off"
              type="text"
              name="description"
              id="edit-description"
              value="${description}"
              placeholder="Product Description"
              class="input" />
            </div>
        
            <div class="form-field">
              <label for="price" class="label"> Price: </label>

              <input
              required
              autocomplete="off"
              type="number"
              id="edit-price"
              name="price"
              value=${price}
              placeholder="Product Price"
              class="input" />
            </div>
        
            <div class="form-field">
              <label for="stock" class="label"> Stock: </label>
              
              <input
              required
              autocomplete="off"
              type="number"
              id="edit-quantity"
              name="stock"
              value=${qty}
              placeholder="Product Stock"
              class="input" />
            </div>
  
            <div class="form-field">
              <label for="category" class="label"> Category: </label>

              <div class="dropdown">
                <select id="category" name="category">
                  <option value="none" selected disabled hidden> ${
                    category[0].toUpperCase() + category.slice(1)
                  } </option> 
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="footwear">Footwear</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            

            <div class="form-field">
              <label for="img" class="label"> Image: </label>
              <input required type="file" id="img" class="input-img" name="file" />
            </div>

            <p class="admin-error" id="client-error-${id}"></p>
          </form>
        </div>
        
        <!-- Edit / Delete Button: -->
        <div class="button-container">
            <button type="button" id="btn-${id}" onclick="editProduct('${id}', this)">update</button>
            <button type="button" class="delete-btn" onclick="inActiveProduct('${id}', this)">Inactive</button>
        </div>
        </div>
    </div>
    `;

  cardContainer?.insertAdjacentHTML("beforeend", product);
};

/* Edit Product: */
const editProduct = async (id, val) => {
  const name =
    val?.parentNode?.parentNode?.children[0]?.children[0]?.children[0]
      ?.children[1]?.value;

  const description =
    val?.parentNode?.parentNode?.children[0]?.children[0]?.children[1]
      ?.children[1]?.value;

  const price =
    val?.parentNode?.parentNode?.children[0]?.children[0]?.children[2]
      ?.children[1]?.value;

  const stock =
    val?.parentNode?.parentNode?.children[0]?.children[0]?.children[3]
      ?.children[1]?.value;

  const category =
    val?.parentNode?.parentNode?.children[0]?.children[0]?.children[4]
      ?.children[1]?.children[0]?.value;

  const file =
    val.parentNode?.parentNode?.children[0]?.children[0]?.children[5]
      ?.children[1]?.files[0];

  const size = Math.round(file?.size / 1024);
  const type = file?.name.split(".").splice(-1)[0];

  const isValid =
    file && size < 250 && (type === "jpeg" || type === "jpg" || type === "png");

  const clientError = document?.getElementById(`client-error-${id}`);
  if (!isValid && file) {
    clientError.innerText = "Max size 250kb. Type: .jpg, .png or .jpeg";
    return;
  } else {
    clientError.innerText = "";
  }

  /* Create Form-data: */
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("category", category);
  file && formData.append("file", file);
  formData.append("description", description);

  /* Add Product to DB: */
  const response = await fetch(`/seller/edit-product/${id}`, {
    method: "POST",
    body: formData,
  });

  if (response.status === 200) {
    /* update img in card: */
    file &&
      document
        .getElementById(`img-${id}`)
        .setAttribute("src", URL.createObjectURL(file));

    const btn = document.getElementById(`btn-${id}`);
    btn.innerHTML = `<i class="fa-solid fa-check fa-btn"></i>`;
    setTimeout(() => {
      btn.innerHTML = "update";
    }, 2000);
  }
};

/* Active Product: */
const activeProduct = async (id) => {
  // mark as active.
  const response = await fetch(`/seller/active-product/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // Remove from DOM upon Successful Activation.
  response.status === 200 &&
    inActiveCardContainer.removeChild(document.querySelector(`.card-${id}`));
};

/* Inactive Product: */
const inActiveProduct = async (id, val) => {
  // mark as Inactive.
  const response = await fetch(`/seller/inactive-product/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  response.status === 200 &&
    cardContainer.removeChild(document.querySelector(`.productCard-${id}`));
};

/* Add Product - button */
document.getElementById("new-product-btn")?.addEventListener("click", () => {
  window.location.replace("/seller/add-product-form");
});

/* Analytics - button */
document.getElementById("analytics-btn")?.addEventListener("click", () => {
  window.location.replace("/seller/analytics");
});

/* Order Request - button */
document.getElementById("order-request-btn")?.addEventListener("click", () => {
  window.location.replace("/seller/order-request");
});

/* Add Product - button */
document
  .getElementById("inactive-product-btn")
  ?.addEventListener("click", () => {
    window.location.replace("/seller/inactive-product-list");
  });

/* Add Product - FORM HANDLER: */
document
  .getElementById("product-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();

    /* Check for Image size (250 kb) and Type(.jpeg | .jpg | .png): */
    const file = document.getElementById("img")?.files[0];

    const size = Math.round(file?.size / 1024);
    const type = file?.name.split(".").splice(-1)[0];

    const isValid =
      size < 250 && (type === "jpeg" || type === "jpg" || type === "png");

    if (!isValid) {
      clientError.innerText = "Follow file upload constraints.";
      return;
    }

    /* Create Form-data: */
    const formData = new FormData();
    formData.append("name", document.getElementById("name")?.value);
    formData.append("price", document.getElementById("price")?.value);
    formData.append("file", document.getElementById("img")?.files[0]);
    formData.append("quantity", document.getElementById("quantity")?.value);
    formData.append("category", document.getElementById("category")?.value);
    formData.append(
      "description",
      document.getElementById("description")?.value
    );

    /* Add Product to DB: */
    const response = await fetch(`/seller/add-product`, {
      method: "POST",
      body: formData,
    });

    clientError.innerText =
      response.status === 403
        ? "Not Authorized to add product!"
        : response.status === 500
        ? "Error! Cannot add product, please try again!"
        : "";

    clientInfo.innerText =
      response.status === 200
        ? "Product added successfully! You will be re-directed to Admin page shortly!"
        : "";

    response.status === 200 &&
      setTimeout(() => {
        window.location.replace("/seller");
      }, 4000);
  });

/* Event Listener on Forward Button: */
document.querySelectorAll(".forward").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.getAttribute("id");
    const status = document.getElementById(`order-request-${id}`).value;

    // MAKE REQUEST TO BACKEND TO UPDATE STATUS:
    const response = await fetch(
      `/seller/forward-order-request/${status}/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    // REMOVE CHILD FROM DOM:
    const orderContainer = document.querySelector(".order-container");
    const childTobeRemovedFromDOM = document.querySelector(
      `.order-wrapper-${id}`
    );

    response.status === 200 &&
      orderContainer.removeChild(childTobeRemovedFromDOM);
  });
});
