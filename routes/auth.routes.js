const router = require("express").Router();

const passport = require("passport");
const { loginValidator, signupValidator } = require("../utils/validation/auth");

const {
  forgotPassword,
  login,
  resetPassword,
  varifySignup,
  signup,
  verifyPassResetCode,
  logout,
} = require("../services/auth.service");

router.post("/signup", signupValidator, signup);
router.get("/verify", varifySignup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

router.post("/logout", logout);

module.exports = router;
