const router = require("express").Router();
const auth = require("../controllers/auth");

// Login - GET:
router.get("/login", auth.login_GET);

// Login - POST:
router.post("/login", auth.login_POST);

// Register - GET:
router.get("/register", auth.register_GET);

// Register - POST:
router.post("/register", auth.register_POST);

// Verify Email - GET:
router.get("/verify/:token", auth.verifyEmail_GET);

// Forgot Password - GET:
router.get("/forgot-password", auth.forgotPassword_GET);

// Forgot Password - POST:
router.post("/update-password", auth.updatePassword_POST);

// Reset Password - GET:
router.get("/reset-password", auth.resetPassword_GET);

// New Password (Forgot) - GET:
router.get("/new-password/:token", auth.newPassword_GET);

// New Password (Forgot/Reset) - POST:
router.post("/new-password/:token", auth.newPassword_POST);

// invalid token - GET:
router.get("/invalid-token", auth.invalid_token_GET);

// Logout:
router.get("/logout", auth.logout_GET);

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// SELLER Login - GET
router.get("/seller-login", auth.seller_login_GET);

// SELLER Login - POST
router.post("/seller-login", auth.seller_login_POST);

// SELLER Register - GET
router.get("/seller-register", auth.seller_register_GET);

// SELLER Register - POST
router.post("/seller-register", auth.seller_register_POST);

module.exports = router;
