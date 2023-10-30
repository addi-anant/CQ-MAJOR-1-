const router = require("express").Router();
const seller = require("../controllers/seller");

/* Home - GET: */
router.get("/", seller.home_GET);

/* Analytics Home - GET: */
router.get("/analytics", seller.analytics_GET);

/* InActive Product List - GET: */
router.get("/inactive-product-list", seller.inActive_product_list_GET);

/* product - GET */
router.get("/product", seller.product_GET);

/* Order Recieved (:month) - GET */
router.get("/order-recieved/:month", seller.order_recieved_GET);

/* Sale Per Month - GET */
router.get("/sale-per-month", seller.sale_per_month_GET);

/* Fetch-Product - GET: */
router.get("/fetch-seller-product", seller.fetch_seller_product_GET);

/* Add-Product-Form - GET: */
router.get("/add-product-form", seller.add_product_form_GET);

/* Add-Product - POST: */
router.post("/add-product", seller.add_product_POST);

/* Edit-Product - POST: */
router.post("/edit-product/:id", seller.edit_product_POST);

/* Mark-as-active-product - GET: */
router.get("/active-product/:id", seller.active_product_GET);

/* Mark-as-inactive-product - GET: */
router.get("/inactive-product/:id", seller.inactive_product_GET);

/* Order Request - GET: */
router.get("/order-request", seller.order_request_GET);

/* Forward Order Request - GET: */
router.get(
  "/forward-order-request/:status/:id",
  seller.forward_order_request_GET
);

module.exports = router;
