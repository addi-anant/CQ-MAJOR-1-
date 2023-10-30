const router = require("express").Router();
const index = require("../controllers/index");

/* Home - GET: */
router.get("/", index.home_GET);

/* Page Count - GET: */
router.get("/page-count/:limit", index.page_count_GET);

/* Fetch Product (:limit) - GET: */
router.get("/fetch-product/:pageNo/:limit", index.fetch_product_GET);

/* Fetch individual Product (:id) - GET: */
router.get("/product/:id", index.product_GET);

/* auth route: */
router.use("/auth", require("./auth"));

/* user route: */
router.use("/user", require("./user"));

/* seller route: */
router.use("/seller", require("./seller"));

/* admin route: */
router.use("/admin", require("./admin"));

/* warehouse route: */
router.use("/warehouse", require("./warehouse"));

/* delivery route: */
router.use("/delivery", require("./delivery"));

module.exports = router;
