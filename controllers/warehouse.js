const { db } = require("../index");

/* Shipper Dashboard: */
module.exports.warehouse_Dashboard_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isShipper) {
    return res.render("shipperHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      shipper: req?.session?.isShipper,
      notAuthorized: true,
      wareHouseNumber: req?.session?.shipperFunction,
    });
  }

  // GET ALL ORDER CORRESSPONGING TO THE SHIPPER Status:
  const order = "SELECT * FROM `order` WHERE status = ? ";
  db.query(
    order,
    [req?.session?.shipperFunction === 1 ? 2 : 4],
    (Error, tobeApprovedOrder) => {
      if (Error) {
        console.log(
          `Error while fetching to be Approved Order- SHIPPER: ${Error}`
        );
        return;
      }

      const order = "SELECT * FROM `order` WHERE status = ? ";
      db.query(
        order,
        [req?.session?.shipperFunction === 1 ? 3 : 5],
        (Error, tobeForwardedOrder) => {
          if (Error) {
            console.log(
              `Error while fetching to be Forwarded Order- SHIPPER: ${Error}`
            );
            return;
          }

          return res.render("warehouse", {
            notAuthorized: false,
            user: req?.session?.user,
            admin: req?.session?.isAdmin,
            seller: req?.session?.isSeller,
            shipper: req?.session?.isShipper,
            tobeForwardedOrder: tobeForwardedOrder,
            tobeApprovedOrder: tobeApprovedOrder,
            wareHouseNumber: req?.session?.shipperFunction,
          });
        }
      );
    }
  );
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

module.exports.approve_Order_Request_GET = (req, res) => {
  const { id, status } = req?.params;

  const forward = "UPDATE `order` SET status = ? WHERE id = ?";
  db.query(forward, [status, id], (Error) => {
    if (Error) {
      console.log(`Error while forwarding order - SELLER: ${Error}`);
      return;
    }

    return res.status(200).json();
  });
};
