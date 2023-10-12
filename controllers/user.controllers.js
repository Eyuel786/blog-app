const User = require("../models/User");

module.exports.renderRegisterForm = (req, res) => {
  res.render("user/register");
};

module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    user.image = req.file.path;
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (error) => {
      if (error) return next(error);
      res.redirect("/blogs");
    });
  } catch (error) {
    console.log("Error:", error.message);
    req.flash("success", "Welcome to BlogApp");
    res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("user/login");
};

module.exports.loginUser = (req, res) => {
  const redirectUrl = req.session.returnTo || "/blogs";
  delete req.session.returnTo;
  req.flash("success", "Welcome back to BlogApp");
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout((error) => {
    if (error) return next(error);
    req.flash("success", "You are successfully logged out");
    res.redirect("/blogs");
  });
};
