const { Router } = require("express");
const {
  renderBlogs,
  createBlog,
  renderNewForm,
  showBlog,
  renderEditForm,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogs.controllers");
const {
  isLoggedIn,
  validateBlog,
  blogExists,
  isBlogAuthor,
} = require("../utils/middlewares");
const imageUpload = require("../utils/imageUpload");
const wrapAsync = require("../utils/wrapAsync");
const router = Router();

router
  .route("/")
  .get(wrapAsync(renderBlogs))
  .post(
    isLoggedIn,
    imageUpload.single("image"),
    validateBlog,
    wrapAsync(createBlog)
  );

router.get("/new", isLoggedIn, renderNewForm);

router
  .route("/:id")
  .get(blogExists, wrapAsync(showBlog))
  .put(
    isLoggedIn,
    imageUpload.single("image"),
    isBlogAuthor,
    validateBlog,
    wrapAsync(updateBlog)
  )
  .delete(isLoggedIn, blogExists, isBlogAuthor, wrapAsync(deleteBlog));

router.get(
  "/:id/edit",
  isLoggedIn,
  blogExists,
  isBlogAuthor,
  wrapAsync(renderEditForm)
);

module.exports = router;
