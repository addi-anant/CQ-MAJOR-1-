const user = require("../controllers/user");
const router = require("express").Router();

/* fetch cart: */
router.get("/cart", user.cart_GET);

/* fetch product: */
router.get("/fetch-cart-product/", user.fetch_cart_product_GET);

/* add product to cart (:id) */
router.get("/add-product-cart/:id", user.add_product_GET);

/* increase product quantity from cart (:id) */
router.post("/increase-quantity/:id", user.increase_quantity_POST);

/* decrease product quantity from cart (:id) */
router.post("/decrease-quantity/:id", user.decrease_quantity_POST);

/* delete product from cart (:id) */
router.get("/delete-product/:id", user.delete_product_GET);

/* USER Dashboard: */
router.get("/dashboard", user.dashboard_GET);

/* order product: GET */
router.get("/order-product", user.order_product_GET);

/* order product: POST */
router.post("/order-product", user.order_product_POST);

/* Cancel order: GET */
router.get("/cancel-order/:id", user.cancel_order_GET);

/* order success: GET */
router.get("/order-success", user.order_success_GET);

/* Update Avatar: POST */
router.post("/update-avatar", user.update_avatar_POST);

/* Track Order: GET */
router.get("/track-order/:id", user.track_order_GET);

module.exports = router;
