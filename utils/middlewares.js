const Blog = require("../models/Blog");
const AppError = require("./AppError");
const { blogSchema } = require("./schemas");
const wrapAsync = require("./wrapAsync");

module.exports.validateBlog = (req, res, next) => {
  const { error } = blogSchema.validate(req.body.blog);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new AppError(errMsg, 400));
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};

module.exports.isBlogAuthor = wrapAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog.author.equals(req.user.id)) {
    return next(new AppError("You are not authorized", 403));
  }
  next();
});
