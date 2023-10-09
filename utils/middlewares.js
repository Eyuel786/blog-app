const AppError = require("./AppError");
const { blogSchema } = require("./schemas");

module.exports.validateBlog = (req, res, next) => {
  const { error } = blogSchema.validate(req.body.blog);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new AppError(errMsg, 400));
  }
  next();
};
