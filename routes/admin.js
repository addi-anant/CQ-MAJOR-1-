const router = require("express").Router();
const admin = require("../controllers/admin");

/* Home - GET: */
router.get("/", admin.adminHome_GET);

/* Approve Product: - GET */
router.get("/:productID", admin.approveProduct_GET);

/* Total Product For Each Category: */
router.get("/graph/total-product-category", admin.totalProductCategory_GET);

/* Total Product Sold For Each Category: */
router.get(
  "/graph/total-product-sold-category",
  admin.totalProductSoldCategory_GET
);

/* Total Sale Amount Per Month: */
router.get("/graph/total-sale-amount", admin.totalSaleAmount_GET);

/* Product Table Info */
router.get("/table/product-info/:category", admin.productTableInfo_GET);

module.exports = router;
