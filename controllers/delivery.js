const { db } = require("../index");
const jwt = require("jsonwebtoken");
const { orderDelivery } = require("../utils/NodeMailer");
const deliveryTokenGeneration = require("../utils/DeliveryTokenGeneration");

/* Delivery Dashboard: */
module.exports.delivery_Dashboard_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isDelivery) {
    return res.render("delivery", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      shipper: req?.session?.isShipper,
      notAuthorized: true,
      wareHouseNumber: req?.session?.shipperFunction,
    });
  }

  // GET ALL ORDER CORRESSPONGING TO THE DELIVERY:
  const order = "SELECT * FROM `order` WHERE status = ? ";
  db.query(order, [6], (Error, tobeApprovedOrder) => {
    if (Error) {
      console.log(
        `Error while fetching to be Approved Order- SHIPPER: ${Error}`
      );
      return;
    }

    const order = "SELECT * FROM `order` WHERE status = ? ";
    db.query(order, [7], (Error, outForDeliveryOrder) => {
      if (Error) {
        console.log(
          `Error while fetching to be Forwarded Order- SHIPPER: ${Error}`
        );
        return;
      }

      return res.render("delivery", {
        notAuthorized: false,
        user: req?.session?.user,
        admin: req?.session?.isAdmin,
        seller: req?.session?.isSeller,
        shipper: req?.session?.isShipper,
        tobeApprovedOrder: tobeApprovedOrder,
        outForDeliveryOrder: outForDeliveryOrder,
        wareHouseNumber: req?.session?.shipperFunction,
      });
    });
  });
};

/* Approve Order Request: */
module.exports.recieve_Order_Request_GET = (req, res) => {
  const { id } = req?.params;

  const forward = "UPDATE `order` SET status = status + 1 WHERE id = ?";
  db.query(forward, [id], (Error) => {
    if (Error) {
      console.log(`Error while forwarding order - SELLER: ${Error}`);
      return;
    }

    return res.status(200).json();
  });
};

/* Out For Delivery Request: */
module.exports.out_For_Delivery_GET = async (req, res) => {
  const { id } = req?.params;

  const forward = "UPDATE `order` SET status = 8 WHERE id = ?";
  db.query(forward, [id], async (Error) => {
    if (Error) {
      console.log(`Error while forwarding order - SELLER: ${Error}`);
      return;
    }

    const token = await deliveryTokenGeneration(id);

    const userEmail =
      "SELECT u.email FROM users u INNER JOIN `order` o ON u.id = o.userID WHERE o.id = ?";
    db.query(userEmail, [id], (Error, info) => {
      if (Error) {
        console.log(`Error while fetching user email - DELIVERY: ${Error}`);
        return;
      }

      // SEND EMAIL TO USER:
      orderDelivery(info[0].email, token, req?.headers?.host);

      return res.status(200).json();
    });
  });
};

/* Order Delivery: */
module.exports.order_Delivery_GET = (req, res) => {
  const { token } = req?.params;

  /* Verifying the JWT token */
  jwt.verify(token, process.env.JWT_SECRET, async (Error, decoded) => {
    if (Error) {
      console.log(`Error while verifying JWT token: ${Error}`);
      return res.redirect("/auth/invalid-token");
    }

    const id = decoded?.id;

    // Set ORDER as Delivered:
    const updateStatus = "UPDATE `order` SET status = 9 WHERE id = ?";

    db.query(updateStatus, [id], (Error) => {
      if (Error) {
        console.log(`Error marking user as verified: ${Error}`);
        return;
      }

      return res.render("orderDelivered", {
        user: null,
        admin: null,
        seller: null,
      });
    });
  });
};
