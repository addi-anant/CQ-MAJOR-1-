const { db } = require("../index");
const { getStatus } = require("../utils/getStatus");

/* GET Cart: */
module.exports.cart_GET = (req, res) => {
  if (req?.session?.isAdmin) return res.redirect("/admin");
  if (req?.session?.isSeller) return res.redirect("/seller");
  if (req?.session?.isShipper) return res.redirect("/warehouse");
  if (req?.session?.isDelivery) return res.redirect("/delivery");

  if (!req.session.isLoggedIn) return res.redirect("/auth/login");
  return res.render("cart", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* fetch product: */
module.exports.fetch_cart_product_GET = async (req, res) => {
  const fetchCartProduct =
    "SELECT c.quantity, p.id, p.name, p.img, p.price FROM cart c INNER JOIN products p ON c.productID = p.id";

  db.query(fetchCartProduct, [req.session.userID], (Error, products) => {
    if (Error) {
      console.log(`Error while getting cart products: ${Error})`);
      return res.status(500).json(Error);
    }

    return res.status(200).json(products);
  });
};

/* add product to cart (:id) */
module.exports.add_product_GET = async (req, res) => {
  const { id } = req.params;

  // check if user is logged in.
  if (!req.session.isLoggedIn) return res.status(401).send();

  // Check if product is already in cart:
  const alreadyInCart = "SELECT * FROM cart WHERE productID = ? AND userID = ?";
  db.query(alreadyInCart, [id, req?.session?.userID], (Error, product) => {
    if (Error) {
      console.log("Product checking product in cart.");
      return;
    }

    if (product.length === 0) {
      // add product to cart with quantity = 1.
      const addProduct =
        "INSERT INTO cart(`userId`, `productId`, `quantity`) VALUES (?)";

      db.query(addProduct, [[req?.session?.userID, id, 1]], (Error) => {
        if (Error) {
          console.log(`Error while adding product to cart: ${Error}`);
          return res.status(500).json(Error);
        }
      });
    }
  });

  return res.status(200).send();
};

/* increase product quantity from cart (:id) */
module.exports.increase_quantity_POST = async (req, res) => {
  const { id } = req.params; /* Product ID */
  const { qty } = req.body; /* count of product in cart */

  /* check if user is logged in. */
  if (!req.session.isLoggedIn)
    return res.status(401).json({ message: "You are not logged in" });

  /* Check if product have enough stock: */
  const stockAmount = "SELECT stock FROM products WHERE id = ?";
  db.query(stockAmount, [id], (Error, amount) => {
    if (Error) {
      console.log(`Error while fetching stock amount of product: ${Error}`);
      return res.status(500).send();
    }

    console.log(amount[0].stock);

    /* Maximum stock count reached: */
    if (amount[0].stock <= qty) return res.status(400).send();

    /* find the specified product and update it's Quantity: */
    const increaseQuantity =
      "UPDATE cart SET quantity = quantity + 1 WHERE userID = ? AND productID = ?";
    db.query(increaseQuantity, [req?.session?.userID, id], (Error) => {
      if (Error) {
        console.log(`Error while incrementing quantity: ${Error}`);
        return res.status(401).json(Error);
      }
    });

    return res.status(200).send();
  });
};

/* decrease product quantity from cart (:id) */
module.exports.decrease_quantity_POST = async (req, res) => {
  const { id } = req.params; /* Product ID */
  const { qty } = req.body; /* count of product in cart */

  /* check if user is logged in. */
  if (!req.session.isLoggedIn)
    return res.status(401).json({ message: "You are not logged in" });

  /* Minimum Quantity count reached: */
  if (qty <= 1) return res.status(400).send();

  /* find the specified product and update it's Quantity: */
  const decreaseQuantity =
    "UPDATE cart SET quantity = quantity - 1 WHERE productID = ? AND userID = ?";

  db.query(decreaseQuantity, [id, req?.session?.userID], (Error) => {
    if (Error) {
      console.log(`Error while decrementing quantity: ${Error}`);
      return res.status(401).json(Error);
    }

    return res.status(200).send();
  });
};

/* delete product from cart (:id) */
module.exports.delete_product_GET = async (req, res) => {
  const { id } = req.params;

  // check if user is logged in.
  if (!req.session.isLoggedIn) {
    console.log("You are not logged in");
    return res.status(401).json({ message: "You are not logged in" });
  }

  const deleteProduct = "DELETE FROM cart WHERE userID = ? AND productID = ?";
  db.query(deleteProduct, [req?.session?.userID, id], (Error) => {
    if (Error) {
      console.log(`Error deleting product from cart: ${Error}`);
      return;
    }

    console.log(`Successfully deleted product`);
  });
  return res.status(200).json({ message: "success" });
};

/* user dashboard: */
module.exports.dashboard_GET = async (req, res) => {
  if (req?.session?.isAdmin) return res.redirect("/admin");
  if (req?.session?.isSeller) return res.redirect("/seller");
  if (req?.session?.isShipper) return res.redirect("/warehouse");
  if (req?.session?.isDelivery) return res.redirect("/delivery");

  // USER NOT LOGGED IN:
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  // FETCH ALL USER ORDER:
  const fetchOrder =
    "SELECT p.price, o.quantity, o.status, p.name, p.img, o.productID, o.id AS orderID FROM `order` o INNER JOIN products p ON o.productID = p.id WHERE userID = ?";
  db.query(fetchOrder, [req?.session?.userID], (orderError, orderList) => {
    if (orderError) {
      console.log(`Error while fetching order: ${orderError}`);
      return;
    }

    // ADD STATUS IN ORDER:
    const ol = orderList.map((order) => {
      order.statusCode = order?.status;

      const status = getStatus(order?.status);
      order.status = status;
      return order;
    });

    // FETCH USER INFO:
    const fetchInfo = "SELECT * FROM users WHERE id = ?";
    db.query(fetchInfo, [req?.session?.userID], (userError, userInfo) => {
      if (userError) {
        console.log(`Error fetching user info: ${userError}`);
        return;
      }

      return res.render("dashboard", {
        user: req?.session?.user,
        admin: req?.session?.isAdmin,
        seller: req?.session?.isSeller,
        userInfo: userInfo,
        orderList: ol,
      });
    });
  });
};

/* order product: GET */
module.exports.order_product_GET = (req, res) => {
  if (req?.session?.isAdmin) return res.redirect("/admin");
  if (req?.session?.isSeller) return res.redirect("/seller");
  if (req?.session?.isShipper) return res.redirect("/warehouse");
  if (req?.session?.isDelivery) return res.redirect("/delivery");

  // USER NOT LOGGED IN:
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  // FETCH USER CART:
  const fetchCart =
    "SELECT p.name, p.price, c.quantity FROM products p INNER JOIN cart c ON p.id = c.productID WHERE c.userID = ?";
  db.query(fetchCart, [req?.session?.userID], (Error, cart) => {
    if (Error) {
      console.log(`Error fetching cart: ${Error}`);
      return;
    }

    const cartAmount =
      "SELECT SUM(p.price * c.quantity) AS amount FROM products p INNER JOIN cart c ON p.id = c.productID WHERE c.userID = ?";

    db.query(cartAmount, [req?.session?.userID], (Error, amount) => {
      if (Error) {
        console.log(`Error while creating cart total: ${Error}`);
        return;
      }

      return res.render("orderSummary", {
        user: req?.session?.user,
        admin: req?.session?.isAdmin,
        seller: req?.session?.isSeller,
        cart: cart,
        amount: amount[0]?.amount,
      });
    });
  });
};

/* order product: POST */
module.exports.order_product_POST = (req, res) => {
  // USER NOT LOGGED IN:
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  // INVALID DETAILS:
  if (
    req?.body?.address === "" ||
    req?.body?.phone === "" ||
    req?.body?.name === ""
  ) {
    return res.status(400).send();
  }

  // INVALID PHONE NUMBER:
  if (req?.body?.phone?.length !== 10) {
    return res.status(403).send();
  }

  // GET THE USER FROM SESSION AND GET THE CART DETAILS:
  const productToBeOrdered =
    "SELECT c.productID, c.quantity FROM cart c INNER JOIN products p ON c.productID = p.id WHERE userID = ?";

  db.query(productToBeOrdered, [req.session.userID], (Error, productList) => {
    if (Error) {
      console.log(`Error while fetching products to be ordered: ${Error}`);
      return;
    }

    productList.forEach((product) => {
      const orderProduct =
        "INSERT INTO `order` (`userID`, `productID`, `quantity`, `address`, `phone`, `name`) VALUES (?)";

      const orderInfo = [
        req?.session?.userID,
        product?.productID,
        product?.quantity,
        req?.body?.address,
        req?.body?.phone,
        req?.body?.name,
      ];

      db.query(orderProduct, [orderInfo], (Error) => {
        if (Error) {
          console.log(`Error while ordering product: ${Error}`);
          return;
        }

        // REMOVE THE ORDERED PRODUCT FROM CART:
        const removeFromCart =
          "DELETE FROM cart WHERE productID = ? AND userID = ?";
        db.query(
          removeFromCart,
          [product?.productID, req?.session?.userID],
          (Error) => {
            if (Error) {
              console.log(`Error while removing product from cart: ${Error}`);
              return;
            }
          }
        );

        // REDUCE STOCK BY QUANTITY:
        const reduceStock =
          "UPDATE products SET stock = stock - ? WHERE id = ?";
        db.query(
          reduceStock,
          [product?.quantity, product?.productID],
          (Error) => {
            if (Error) {
              console.log(
                `Error while reducing stock of product after order: ${Error}`
              );
              return;
            }
          }
        );

        return res.status(200).send();
      });
    });
  });
};

/* cancel order: GET */
module.exports.cancel_order_GET = (req, res) => {
  const { id } = req?.params;

  // CHECK IF THE ORDER IS ALREADY DELIVERED:
  const alreadyDelivered = "SELECT status FROM `order` WHERE id = ?";
  db.query(alreadyDelivered, [parseInt(id)], (Error, statusCode) => {
    if (Error) {
      console.log(
        `Error while checking if order is already delivered: ${Error}`
      );
      return;
    }

    if (statusCode[0].status === 9) {
      return res.status(400).send();
    } else {
      // MARK STATUS OF ORDER AS 0 -> CANCEL ORDER:
      const cancelOrder = "UPDATE `order` SET status = ? WHERE id = ?";
      db.query(cancelOrder, [0, parseInt(id)], (Error) => {
        if (Error) {
          console.log(`Error while cancelling order: ${Error}`);
          return;
        }

        // FETCH THE QUANTITY OF PRODUCT ORDERED:
        const fetchOrderQuantity = "SELECT quantity FROM `order` WHERE id = ?";
        db.query(fetchOrderQuantity, [parseInt(id)], (Error, quantity) => {
          if (Error) {
            console.log(`Error while cancelling order: ${Error}`);
            return;
          }

          // INCREASE THE STOCK OF PRODUCT ONCE CANCELLED:
          const increaseStock =
            "UPDATE products SET stock = stock + ? WHERE id = (SELECT productID FROM `order` WHERE id = ?)";
          db.query(increaseStock, [quantity[0].quantity, id], (Error) => {
            if (Error) {
              console.log(`Error while cancelling order: ${Error}`);
              return;
            }

            return res.status(200).send();
          });
        });
      });
    }
  });
};

/* order success: GET */
module.exports.order_success_GET = (req, res) => {
  if (req?.session?.isAdmin) return res.redirect("/admin");
  if (req?.session?.isSeller) return res.redirect("/seller");
  if (req?.session?.isShipper) return res.redirect("/warehouse");
  if (req?.session?.isDelivery) return res.redirect("/delivery");

  // USER NOT LOGGED IN:
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");
  return res.render("orderSuccess", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* update avatar: POST */
module.exports.update_avatar_POST = (req, res) => {
  const file = req?.file?.filename;

  const updateAvatar = "UPDATE users SET avatar = ? WHERE id = ?";
  db.query(updateAvatar, [file, req?.session?.userID], (Error) => {
    if (Error) {
      console.log(`Error while updating avatar: ${Error}`);
      return;
    }

    return res.status(200).send();
  });
};

/* Track Order(:id): GET */
module.exports.track_order_GET = (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const { id } = req.params;
  const trackOrder = "SELECT status AS statusCode FROM `order` WHERE id = ?";
  db.query(trackOrder, [parseInt(id)], (Error, statusCode) => {
    if (Error) {
      console.log(`Error Fetching order status code: ${Error}`);
      return;
    }

    return res.status(200).json({ statusCode: statusCode[0].statusCode });
  });
};
