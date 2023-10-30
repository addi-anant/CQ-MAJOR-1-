const { db } = require("../index");

/* Admin Home - GET: */
module.exports.adminHome_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/auth/login");

  if (!req.session.isAdmin)
    return res.render("adminHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: true,
    });

  // GET ALL PRODUCT THAT NEED TO BE APPROVED:
  const toBeApprovedProduct = "SELECT * FROM products WHERE approved = 0";
  db.query(toBeApprovedProduct, (Error, toBeApproved) => {
    if (Error) {
      console.log(`Error fetching to be approved products: ${Error}`);
      return;
    }

    return res.render("adminHome", {
      user: req?.session?.user,
      admin: req?.session?.isAdmin,
      seller: req?.session?.isSeller,
      notAuthorized: false,
      toBeApproved: toBeApproved,
    });
  });
};

/* Approve Product: - GET */
module.exports.approveProduct_GET = (req, res) => {
  const id = req?.params?.productID;

  const updateStatus = "UPDATE products SET approved = 1 WHERE id = ?";
  db.query(updateStatus, [id], (Error) => {
    if (Error) {
      console.log(`Error while approving products: ${Error}`);
      return;
    }

    return res.status(200).json();
  });
};

/* Total Product For Each Category: */
module.exports.totalProductCategory_GET = (req, res) => {
  const q =
    "SELECT category, COUNT(*) AS count FROM products GROUP BY category";
  db.query(q, (Error, data) => {
    if (Error) {
      console.log(`Error while fetching total product per category: ${Error}`);
      return;
    }

    return res.status(200).json({ data: data });
  });
};

/* Total Product For Sold Each Category: */
module.exports.totalProductSoldCategory_GET = (req, res) => {
  const q =
    "SELECT p.category, COUNT(*) AS count FROM products p INNER JOIN `order` o ON p.id = o.productID GROUP BY p.category";
  db.query(q, (Error, data) => {
    if (Error) {
      console.log(`Error while fetching total product per category: ${Error}`);
      return;
    }

    return res.status(200).json({ data: data });
  });
};

/* Total Sale Amount Per Month: */
module.exports.totalSaleAmount_GET = (req, res) => {
  const q =
    "SELECT MONTH(o.time) AS month, SUM(o.quantity * p.price) AS amount FROM products p INNER JOIN `order` o ON p.id = o.productID GROUP BY MONTH(o.time)";
  db.query(q, (Error, data) => {
    if (Error) {
      console.log(`Error while fetching total product per category: ${Error}`);
      return;
    }

    console.log(data);

    return res.status(200).json({ data: data });
  });
};

/* Product Table Info: - GET */
module.exports.productTableInfo_GET = (req, res) => {
  const { category } = req?.params;

  const fetchProduct =
    category === "all"
      ? "SELECT id, name, price, stock, sellerID, active, approved, category FROM products"
      : "SELECT id, name, price, stock, sellerID, active, approved, category FROM products WHERE category = ?";

  db.query(fetchProduct, [category], (Error, tableInfo) => {
    if (Error) {
      console.log(`Error while fetching product table info: ${Error}`);
      return;
    }

    console.log(tableInfo);

    return res.status(200).json(tableInfo);
  });
};
