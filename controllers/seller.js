const { db } = require("../index");
const { getStatus } = require("../utils/getStatus");

/* Home - GET: */
module.exports.home_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  const notApprovedProduct =
    "SELECT * FROM products WHERE approved = 0 AND sellerID = ?";

  db.query(
    notApprovedProduct,
    [req?.session?.sellerID],
    (Error, notApproved) => {
      if (Error) {
        console.log(`Error fetching not approved product: ${Error}`);
        return;
      }

      return res.render("sellerHome", {
        user: req?.session?.user,
        admin: req?.session?.isAdmin,
        seller: req?.session?.isSeller,
        notAuthorized: false,
        notApproved: notApproved,
      });
    }
  );
};

/* Analytics Home - GET: */
module.exports.analytics_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  return res.render("sellerAnalytics", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
    notAuthorized: false,
  });
};

/* Inactive Product List - GET: */
module.exports.inActive_product_list_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  const notActiveProduct =
    "SELECT * FROM products WHERE active = 0 AND sellerID = ?";

  db.query(
    notActiveProduct,
    [req?.session?.sellerID],
    (Error, inActiveList) => {
      if (Error) {
        console.log(`Error fetching not approved product: ${Error}`);
        return;
      }

      return res.render("inActiveProduct", {
        user: req?.session?.user,
        admin: req?.session?.isAdmin,
        seller: req?.session?.isSeller,
        notAuthorized: false,
        inActiveList: inActiveList,
      });
    }
  );
};

/* Product - GET: */
module.exports.product_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  const getProducts =
    "SELECT id, name, price, stock, active, approved, category FROM products WHERE sellerID = ?";
  db.query(getProducts, [req?.session?.sellerID], (Error, product) => {
    if (Error) {
      console.log(`Fetching Seller Product Error: ${Error}.`);
      return;
    }

    return res.status(200).json(product);
  });
};

/* Order Recieved (:month) - GET */
module.exports.order_recieved_GET = async (req, res) => {
  const { month } = req?.params;

  const orderInfo =
    "SELECT o.id, o.userID, o.quantity, o.status, p.price FROM products p INNER JOIN `order` o ON p.id = o.productID WHERE p.sellerID = ? AND MONTH(o.time) = ?";

  db.query(
    orderInfo,
    [req?.session?.sellerID, parseInt(month)],
    (Error, info) => {
      if (Error) {
        console.log(`Error while fetching order info - SELLER: ${Error}`);
        return;
      }

      const modifiedDataSource = info.map((data) => {
        return {
          ...data,
          status: getStatus(data?.status),
        };
      });

      return res.status(200).json(modifiedDataSource);
    }
  );
};

/* Sale Per Month - GET */
module.exports.sale_per_month_GET = async (req, res) => {
  const salePerMonth =
    "SELECT SUM(o.quantity * p.price) AS amount, MONTH(o.time) AS month FROM products p INNER JOIN `order` o ON p.id = o.productID WHERE p.sellerID = ? AND o.status != 0 GROUP BY MONTH(o.time)";

  db.query(salePerMonth, [req?.session?.sellerID], (Error, info) => {
    if (Error) {
      console.log(`Error while fetching sale per month - SELLER: ${Error}`);
      return;
    }

    console.log(info);

    return res.status(200).json({ data: info });
  });
};

/* Fetch-Product - GET: */
module.exports.fetch_seller_product_GET = async (req, res) => {
  if (!req?.session?.isLoggedIn && !req?.session?.isSeller)
    return res.status(403).send();

  const getProducts =
    "SELECT * FROM products WHERE approved = 1 AND active = 1 AND sellerID = ?";
  db.query(getProducts, [req?.session?.sellerID], (Error, products) => {
    if (Error) {
      console.log(`Fetching Seller Product Error: ${Error}.`);
      return;
    }

    return res.status(200).json(products);
  });
};

/* Add-Product-Form - GET: */
module.exports.add_product_form_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");
  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: "You are not authorized to view this page.",
    });

  return res.render("addProductForm", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* Add-Product - POST: */
module.exports.add_product_POST = async (req, res) => {
  if (!req.session.isLoggedIn && !req.session.isSeller)
    return res.status(403).send();

  const product =
    "INSERT INTO products(`name`, `price`, `description`, `img`, `sellerID`, `stock`, `category`) VALUES (?)";

  const { name, price, description, quantity, category } = req.body;
  const productInfo = [
    name,
    price,
    description,
    req?.file?.filename,
    req?.session?.sellerID,
    quantity,
    category,
  ];

  db.query(product, [productInfo], (err) => {
    if (err) {
      console.log("Error adding product.");
      console.log(err);
      return;
    }

    return res.status(200).send();
  });
};

/* Edit-Product - POST: */
module.exports.edit_product_POST = async (req, res) => {
  const { id } = req.params;

  if (!req.session.isLoggedIn && !req.session.isSeller)
    return res.status(403).send();

  // UPDATE IMG:
  const img = req?.file?.filename;
  if (img) {
    const updateImg = "UPDATE products SET img = ? WHERE id = ?";
    db.query(updateImg, [img, id], (Error) => {
      if (Error) {
        console.log(`Error updating product Img ${Error}`);
        return;
      }
    });
  }

  // UPDATE PRODUCT INFO:
  const product =
    "UPDATE products SET name = ?, price = ?, description = ?, stock = ?, category = ? WHERE id = ?";

  const { name, price, description, stock, category } = req.body;
  const productInfo = [name, price, description, stock, category];

  db.query(product, [...productInfo, id], (Error) => {
    if (Error) {
      console.log(`Error updating product ${Error}`);
      return res.status(500).send();
    }

    return res.status(200).send();
  });
};

/* Inactive-Product - GET: */
module.exports.inactive_product_GET = async (req, res) => {
  const { id } = req.params;

  if (!req.session.isLoggedIn && !req.session.isSeller)
    return res.status(403).send();

  /* Inactive Product: */
  const inactiveProduct = "UPDATE products SET active = 0 WHERE id = ?";
  db.query(inactiveProduct, [id], (Error) => {
    if (Error) {
      console.log(`Error while in-activating Product - SELLER: ${Error}`);
      return res.status(500).send();
    }

    // REMOVE THE ORDERED PRODUCT FROM CART:
    const removeFromCart = "DELETE FROM cart WHERE productID = ?";
    db.query(removeFromCart, [id], (Error) => {
      if (Error) {
        console.log(
          `Error while removing product from cart - INACTIVATING: ${Error}`
        );
        return;
      }
    });

    return res.status(200).send();
  });
};

/* active-Product - GET: */
module.exports.active_product_GET = async (req, res) => {
  const { id } = req.params;

  if (!req.session.isLoggedIn && !req.session.isSeller)
    return res.status(403).send();

  /* active Product: */
  const activeProduct = "UPDATE products SET active = 1 WHERE id = ?";
  db.query(activeProduct, [id], (Error) => {
    if (Error) {
      console.log(`Error while ctivating Product - SELLER: ${Error}`);
      return res.status(500).send();
    }

    return res.status(200).send();
  });
};

module.exports.order_request_GET = async (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isSeller)
    return res.render("sellerHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  const orderWithSeller =
    "SELECT * FROM products p INNER JOIN `order` o ON p.id = o.productID WHERE o.status = 1 AND p.sellerID = ?";

  db.query(orderWithSeller, [req?.session?.sellerID], (Error, orderList) => {
    if (Error) {
      console.log(`Error while fetching order info - SELLER: ${Error}`);
      return;
    }

    return res.render("orderRequest", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      orderList: orderList,
      notAuthorized: false,
    });
  });
};

module.exports.forward_order_request_GET = async (req, res) => {
  const { status, id } = req?.params;

  const forward = "UPDATE `order` SET status = ? WHERE id = ?";
  db.query(forward, [status, id], (Error) => {
    if (Error) {
      console.log(`Error while forwarding order - SELLER: ${Error}`);
      return;
    }

    return res.status(200).json();
  });
};
