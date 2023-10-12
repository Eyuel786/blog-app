const { Router } = require("express");
const imageUpload = require("../utils/imageUpload");
const { validateUser } = require("../utils/middlewares");
const passport = require("passport");
const {
  renderRegisterForm,
  registerUser,
  loginUser,
  renderLoginForm,
  logoutUser,
} = require("../controllers/user.controllers");
const router = Router();

router
  .route("/register")
  .get(renderRegisterForm)
  .post(imageUpload.single("image"), validateUser, registerUser);

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    validateUser,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
      keepSessionInfo: true,
    }),
    loginUser
  );

router.get("/logout", logoutUser);

module.exports = router;
