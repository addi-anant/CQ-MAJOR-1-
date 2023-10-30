const router = require("express").Router();
const warehouse = require("../controllers/warehouse");

/* warehouse Dashboard: */
router.get("/", warehouse.warehouse_Dashboard_GET);

/* Recieve Order Request: */
router.get("/recieve-order-request/:id", warehouse.recieve_Order_Request_GET);

/* Approve Order Request: */
router.get(
  "/approve-order-request/:status/:id",
  warehouse.approve_Order_Request_GET
);

module.exports = router;
