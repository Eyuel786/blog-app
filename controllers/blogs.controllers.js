const fs = require("fs");
const Blog = require("../models/Blog");

module.exports.renderBlogs = async (req, res) => {
  const blogs = await Blog.find({})
    .populate({
      path: "author",
      select: "username email image",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username email image",
      },
    });
  res.render("blogs/index", { blogs });
};

module.exports.createBlog = async (req, res) => {
  const { title, subtitle, content } = req.body;
  const blog = new Blog({ title, subtitle, content });
  blog.image = req.file.path;
  blog.author = req.user;
  await blog.save();
  req.flash("success", "Successfully created blog");
  res.redirect(`/blogs/${blog.id}`);
};

module.exports.renderNewForm = (req, res) => {
  res.render("blogs/new");
};

module.exports.showBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate({
      path: "author",
      select: "username email image",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username email image",
      },
    });
  res.render("blogs/show", { blog, allowComment: false });
};

module.exports.renderEditForm = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("blogs/edit", { blog });
};

module.exports.updateBlog = async (req, res, next) => {
  const { title, subtitle, content } = req.body;
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { title, subtitle, content },
    {
      new: true,
      runValidators: true,
    }
  );
  if (req.file) {
    fs.unlink(blog.image, (error) => {
      if (error) return next(error);
    });
    blog.image = req.file.path;
    await blog.save();
  }
  req.flash("success", "Successfully updated blog");
  res.redirect(`/blogs/${blog.id}`);
};

module.exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted blog");
  res.redirect("/blogs");
};
