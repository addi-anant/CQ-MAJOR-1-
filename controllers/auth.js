const jwt = require("jsonwebtoken");
const tokenGeneration = require("../utils/TokenGeneration");
const validatePassword = require("../utils/validatePassword");
const {
  verifyEmail,
  updatePassword,
  successful,
} = require("../utils/NodeMailer");
const { db } = require("../index");

/* Login: GET */
module.exports.login_GET = (req, res) => {
  if (req?.session?.isLoggedIn) return res.redirect("/");
  return res.render("login", {
    user: null,
    admin: null,
    seller: null,
  });
};

/* Login: POST */
module.exports.login_POST = async (req, res) => {
  const { email, password } = req.body;

  // Both email and password are required:
  if (email === "" || password === "") return res.status(400).send();

  try {
    const q = "SELECT * FROM users WHERE email = ? AND password = ?";
    const values = [email, password];

    db.query(q, values, (err, user) => {
      // Error while fetching query:
      if (err) return res.status(404).send();

      // No user with provided credentials:
      if (user.length === 0) return res.status(404).send();

      // check for Email verification:
      if (!user[0]?.verified) return res.status(401).send();

      // Valid Credentials:
      req.session.isSeller = false;
      req.session.isLoggedIn = true;
      req.session.user = user[0]?.name;
      req.session.userID = user[0]?.id;
      req.session.email = user[0]?.email;
      req.session.isAdmin = user[0]?.admin;
      req.session.isShipper = user[0]?.shipperFunction !== 0 ? true : false;
      req.session.isDelivery = user[0]?.shipperFunction === 4 ? true : false;
      req.session.shipperFunction = user[0]?.shipperFunction;

      return req.session.isAdmin
        ? res.status(206).send()
        : req.session.isShipper
        ? res.status(201).send()
        : req.session.isDelivery
        ? res.status(204).send()
        : res.status(200).send();
    });
  } catch (Error) {
    console.log(`Error while Login: ${Error}`);
    return res.status(500).json(Error);
  }
};

/* Register: GET */
module.exports.register_GET = (req, res) => {
  if (req?.session?.isLoggedIn) return res.redirect("/");

  return res.render("register", {
    user: null,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* Register: POST */
module.exports.register_POST = async (req, res) => {
  const { name, email, password } = req.body;

  // All field are required:
  if (name === "" || email === "" || password === "")
    return res.status(400).send();

  // validate password:
  if (!validatePassword(password)) return res.status(406).send();

  // check for existing user with provided Email:
  const exist = "SELECT * FROM users WHERE email = ?";

  db.query(exist, [email], (err, user) => {
    // Error while fetching query:
    if (err) return res.status(404).send();

    // Email already in use:
    if (user.length !== 0) return res.status(401).send();
  });

  // Create New USER:
  const createNewUser =
    "INSERT INTO users(`name`, `email`, `password`) VALUES (?)";

  db.query(createNewUser, [[name, email, password]], async (Error) => {
    if (Error) {
      console.log(`Error while creating new user: ${Error}`);
      return res.status(500);
    }

    // GENERATE TOKEN FOR VERIFICATION:
    const token = await tokenGeneration(email);

    // SEND LINK FOR EMAIL VERIFICATION:
    await verifyEmail(email, token, req.headers.host);

    // ACCOUNT CREATION DONE:
    return res.status(200).send();
  });
};

/* Verify Email: */
module.exports.verifyEmail_GET = async (req, res) => {
  const { token } = req.params;

  /* Verifying the JWT token */
  jwt.verify(token, process.env.JWT_SECRET, async (Error, decoded) => {
    if (Error) {
      console.log(`Error while verifying JWT token: ${Error}`);
      return res.redirect("/auth/invalid-token");
    }

    const email = decoded?.email;
    const seller = decoded?.seller;

    // Set USER as VERIFIED:
    const setVerified = !seller
      ? "UPDATE users SET verified = 1 WHERE email = ?"
      : "UPDATE seller SET verified = 1 WHERE email = ?";

    db.query(setVerified, [[email]], (err) => {
      if (err) console.log("Error marking user as verified");
    });

    if (!seller) {
      const findUSER = "SELECT * FROM users WHERE email = ?";

      db.query(findUSER, [[email]], (err, user) => {
        if (err) console.log("Error while fetching user.");

        req.session.isSeller = false;
        req.session.isLoggedIn = true;
        req.session.user = user[0]?.name;
        req.session.userID = user[0]?.id;
        req.session.email = user[0]?.email;
        req.session.isAdmin = user[0]?.admin;
        req.session.isShipper = user[0]?.shipperFunction !== 0 ? true : false;
        req.session.isDelivery = user[0]?.shipperFunction === 4 ? true : false;
        req.session.shipperFunction = user[0]?.shipperFunction;

        res.redirect("/");
      });
    } else {
      const findSELLER = "SELECT * FROM seller WHERE email = ?";

      console.log(email);

      db.query(findSELLER, [[email]], (Error, seller) => {
        if (Error) console.log(`Error while fetching seller: ${Error})`);

        req.session.isSeller = true;
        req.session.isLoggedIn = true;
        req.session.user = user[0]?.name;
        req.session.userID = user[0]?.id;
        req.session.email = user[0]?.email;
        req.session.isAdmin = user[0]?.admin;
        req.session.isShipper = user[0]?.shipperFunction !== 0 ? true : false;
        req.session.isDelivery = user[0]?.shipperFunction === 4 ? true : false;
        req.session.shipperFunction = user[0]?.shipperFunction;

        res.redirect("/seller");
      });
    }
  });
};

/* Forgot Password: GET */
module.exports.forgotPassword_GET = (req, res) => {
  return res.render("updatePassword", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
    heading: "Forgot Password",
  });
};

/* Forgot Password - POST: */
module.exports.updatePassword_POST = async (req, res) => {
  const { email } = req.body;

  // NO EMAIL PROVIDED:
  if (email === "") return res.status(400).send();

  // CHECK IF ANY USER WITH PROVIDED EMAIL EXISTS:
  const userExist = "SELECT * FROM users WHERE email = ?";
  db.query(userExist, [[email]], async (Error, user) => {
    if (Error) {
      console.log(`Error while fetching user: ${Error}`);
      return res.status(404).send();
    }

    // USER WITH PROVIDED EMAIL EXIST:
    if (user.length !== 0) {
      // GENERATE TOKEN FOR VERIFICATION:
      const token = await tokenGeneration(email);

      // SEND MAIL FOR VERIFICATION:
      await updatePassword(email, token, req.headers.host);

      return res.status(200).send();
    } else {
      // CHECK IF ANY SELLER WITH PROVIDED EMAIL EXISTS:
      const sellerExist = "SELECT * FROM seller WHERE email = ?";
      db.query(sellerExist, [[email]], async (Error, seller) => {
        if (Error) {
          console.log(`Error while fetching seller: ${Error}`);
          return res.status(404).send();
        }

        // SELLER WITH PROVIDED EMAIL EXIST:
        if (seller.length != 0) {
          // GENERATE TOKEN FOR VERIFICATION:
          const token = await tokenGeneration(email, true);

          // SEND MAIL FOR VERIFICATION:
          await updatePassword(email, token, req.headers.host);

          return res.status(200).send();
        }
      });
    }

    // NO ACCOUNT FOUND:
    return res.status(404).send();
  });

  // GENERATE TOKEN FOR VERIFICATION:
  const token = await tokenGeneration(email);

  // SEND MAIL FOR VERIFICATION:
  await updatePassword(email, token, req.headers.host);

  return res.status(200).send();
};

/* Reset Password: GET */
module.exports.resetPassword_GET = (req, res) => {
  if (!req.session.isLoggedIn) return res.redirect("/");

  return res.render("newPassword", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
    heading: "Reset Password",
  });
};

/* NEW Password - GET: */
module.exports.newPassword_GET = (req, res) => {
  return res.render("newPassword", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
    heading: "Enter New Password",
  });
};

/* NEW Password - POST: */
module.exports.newPassword_POST = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password === "" || confirmPassword === "") return res.status(400).send();
  if (password !== confirmPassword) return res.status(409).send();

  // validate password:
  if (!validatePassword(password)) return res.status(406).send();

  /* -> RESET PASSWORD CASE -> (token === undefined): */
  if (token === "undefined") {
    const updatePassword = !req?.session?.isSeller
      ? "UPDATE users SET password = ? WHERE email = ?"
      : "UPDATE seller SET password = ? WHERE email = ?";

    db.query(updatePassword, [password, req?.session?.email], async (err) => {
      if (err) {
        console.log("Error while updating password.");
        console.log(err);
        return;
      }

      /* password successfully updated mail! */
      await successful(req.session.email);

      /* Remove user from session: */
      req.session.destroy();
    });

    return res.status(200).send();
  }

  // FORGOT PASSWORD CASE: -> VERIFY TOKEN AND UPDATE PASSWORD:
  jwt.verify(token, process.env.JWT_SECRET, async (Error, decoded) => {
    if (Error) {
      console.log(`Error while verifying JWT token: ${Error}`);
      return res.status(500).send();
    }

    const email = decoded?.email;
    const seller = decoded?.seller;

    const updatePassword = !seller
      ? "UPDATE users SET password = ? WHERE email = ?"
      : "UPDATE seller SET password = ? WHERE email = ?";

    db.query(updatePassword, [password, email], async (Error) => {
      if (Error) {
        console.log(`Error while updating password ${Error}`);
        return res.status(500).send();
      }
    });

    /* password successfully updated mail! */
    await successful(email);

    /* Remove user from session: */
    req.session.destroy();

    return res.status(200).send();
  });
};

/* LOGOUT - GET: */
module.exports.logout_GET = (req, res) => {
  req.session.destroy();
  return res.redirect("/auth/login");
};

/* Invalid Token: */
module.exports.invalid_token_GET = (req, res) => {
  return res.render("invalidURL", {
    user: req?.session?.user,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

/* SELLER Login - GET */
module.exports.seller_login_GET = (req, res) => {
  if (req?.session?.isLoggedIn) return res.redirect("/");
  return res.render("sellerLogin", {
    user: null,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* SELLER Login - POST */
module.exports.seller_login_POST = (req, res) => {
  const { email, password } = req.body;

  // Both email and password are required:
  if (email === "" || password === "") return res.status(400).send();

  try {
    const q = "SELECT * FROM seller WHERE email = ? AND password = ?";
    const values = [email, password];

    db.query(q, values, (err, seller) => {
      // Error while fetching query:
      if (err) return res.status(404).send();

      // No user with provided credentials:
      if (seller.length === 0) return res.status(404).send();

      // check for Email verification:
      if (!seller[0]?.verified) return res.status(401).send();

      // Valid Credentials:
      req.session.isSeller = true;
      req.session.isLoggedIn = true;
      req.session.user = seller[0].name;
      req.session.sellerID = seller[0]?.id;
      req.session.email = seller[0]?.email;

      return res.status(200).send();
    });
  } catch (Error) {
    console.log(`Error while Login: ${Error}`);
    return res.status(500).json(Error);
  }
};

/* SELLER Register - GET */
module.exports.seller_register_GET = (req, res) => {
  if (req?.session?.isLoggedIn) return res.redirect("/");
  return res.render("sellerRegister", {
    user: null,
    admin: req?.session?.isAdmin,
    seller: req?.session?.isSeller,
  });
};

/* SELLER Register - POST */
module.exports.seller_register_POST = (req, res) => {
  const { name, email, password, phone, company } = req.body;
  const gstFile = req?.file?.filename;

  // All field are required:
  if (
    name === "" ||
    email === "" ||
    password === "" ||
    phone === "" ||
    company === "" ||
    !gstFile
  )
    return res.status(400).send();

  // validate password:
  if (!validatePassword(password)) return res.status(406).send();

  try {
    // check for existing user with provided Email:
    const exist = "SELECT * FROM seller WHERE email = ?";

    db.query(exist, [email], (err, user) => {
      // Error while fetching query:
      if (err) return res.status(404).send();

      // Email already in use:
      if (user.length !== 0) return res.status(401).send();
    });

    // Create New SELLER:
    const createNewUser =
      "INSERT INTO seller(`name`, `email`, `password`, `number`, `company`, `gstNo`) VALUES (?)";

    db.query(
      createNewUser,
      [[name, email, password, phone, company, gstFile]],
      async (err) => {
        if (err) {
          console.log(err);
          return res.status(500);
        }

        // GENERATE TOKEN FOR VERIFICATION:
        const token = await tokenGeneration(email, true);

        // SEND LINK FOR EMAIL VERIFICATION:
        await verifyEmail(email, token, req.headers.host);

        // ACCOUNT CREATION DONE:
        return res.status(200).send();
      }
    );
  } catch (Error) {
    console.log(`Error while Registeration: ${Error}`);
    return res.status(500).json(Error);
  }
};
