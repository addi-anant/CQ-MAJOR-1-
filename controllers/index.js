const { db } = require("../index");

/* Home: GET */
module.exports.home_GET = (req, res) => {
  if (req?.session?.isAdmin) return res.redirect("/admin");
  if (req?.session?.isSeller) return res.redirect("/seller");
  if (req?.session?.isShipper) return res.redirect("/warehouse");
  if (req?.session?.isDelivery) return res.redirect("/delivery");

  return res.render("home", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* Number of Product Page: GET */
module.exports.page_count_GET = async (req, res) => {
  const { limit } = req.params;
  const pageCount = "SELECT COUNT(*) AS count FROM products WHERE approved = 1";
  db.query(pageCount, (Error, count) => {
    if (Error) {
      console.log(
        `Error while fetching product count for pagination: ${Error}`
      );
      return;
    }

    return res.status(200).json({
      count:
        count[0].count % parseInt(limit)
          ? Math.floor(count[0].count / parseInt(limit)) + 1
          : count[0].count / parseInt(limit),
    });
  });
};

/* Fetch Product: GET */
module.exports.fetch_product_GET = async (req, res) => {
  const { pageNo, limit } = req.params;

  const NumberOfProducts =
    "SELECT COUNT(*) AS count FROM products WHERE approved = 1 AND active = 1 AND stock > 0";

  const fetchProduct =
    "SELECT * FROM products WHERE approved = 1 AND active = 1 AND stock > 0 LIMIT ? OFFSET ?";

  db.query(NumberOfProducts, (countError, count) => {
    if (countError) {
      console.log(`Error while counting products: ${countError}`);
      return;
    }

    // OUT OF BOUND CASE:
    if ((pageNo - 1) * parseInt(limit) >= count[0].count) return;

    // FETCH PRODUCT:
    db.query(
      fetchProduct,
      [parseInt(limit), (pageNo - 1) * parseInt(limit)],
      (Error, productList) => {
        if (Error) {
          console.log(`Error while getting products: ${Error})`);
          return res.status(500).json(Error);
        }

        return res.status(200).json(productList);
      }
    );
  });
};

/* Individual Product (:id) */
module.exports.product_GET = async (req, res) => {
  const { id } = req.params;
  const findProduct = "SELECT * FROM products WHERE id = ?";
  db.query(findProduct, [id], (Error, product) => {
    if (Error) {
      console.log(`Error while getting products: ${Error})`);
      return res.status(500).json(Error);
    }

    res.status(200).json(product[0]);
  });
};
