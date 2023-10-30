const router = require("express").Router();
const delivery = require("../controllers/delivery");

/* Delivery Dashboard: */
router.get("/", delivery.delivery_Dashboard_GET);

/* Recieve Order Request: */
router.get("/recieve-order-request/:id", delivery.recieve_Order_Request_GET);

/* Out For Delivery Request: */
router.get("/out-for-delivery-request/:id", delivery.out_For_Delivery_GET);

/* Order Delivery: */
router.get("/success/:token", delivery.order_Delivery_GET);

module.exports = router;
