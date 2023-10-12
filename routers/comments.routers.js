const { Router } = require("express");
const {
  isLoggedIn,
  blogExists,
  validateComment,
  commentExists,
  isCommentAuthor,
} = require("../utils/middlewares");
const {
  renderCommentForm,
  createComment,
  deleteComment,
} = require("../controllers/comments.controllers");
const wrapAsync = require("../utils/wrapAsync");

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(isLoggedIn, blogExists, wrapAsync(renderCommentForm))
  .post(isLoggedIn, blogExists, validateComment, wrapAsync(createComment));

router.delete(
  "/:commentId",
  isLoggedIn,
  blogExists,
  commentExists,
  isCommentAuthor,
  wrapAsync(deleteComment)
);

module.exports = router;
