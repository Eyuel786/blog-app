const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const AppError = require("./AppError");
const { blogSchema, commentSchema, userSchema } = require("./schemas");
const wrapAsync = require("./wrapAsync");

module.exports.validateBlog = (req, res, next) => {
  const { error } = blogSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new AppError(errMsg, 400));
  }
  next();
};

module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body.comment);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new AppError(errMsg, 400));
  }
  next();
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
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

module.exports.isCommentAuthor = wrapAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment.author.equals(req.user.id)) {
    return next(new AppError("You are not authorized", 403));
  }
  next();
});

module.exports.blogExists = wrapAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash("error", "Blog not found");
    return res.redirect("/blogs");
  }
  next();
});

module.exports.commentExists = wrapAsync(async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    req.flash("error", "Comment not found");
    return res.redirect(`/blogs/${id}`);
  }
  next();
});
