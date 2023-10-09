const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Blog = require("./models/Blog");
const wrapAsync = require("./utils/wrapAsync");
const AppError = require("./utils/AppError");
const { validateBlog } = require("./utils/middlewares");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/blog-app")
  .catch(console.error.bind(console, "Initial DB connection error:"));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB connection error"));
db.once("open", () => console.log("Database connected"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

// INDEX route
app.get(
  "/blogs",
  wrapAsync(async (req, res) => {
    const blogs = await Blog.find({});
    res.render("blogs/index", { blogs });
  })
);

// POST route
app.post(
  "/blogs",
  validateBlog,
  wrapAsync(async (req, res) => {
    const blog = new Blog(req.body.blog);
    await blog.save();
    res.redirect(`/blogs/${blog.id}`);
  })
);

app.get("/blogs/new", (req, res) => {
  res.render("blogs/new");
});

// SHOW route
app.get(
  "/blogs/:id",
  wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/show", { blog });
  })
);

// UPDATE route
app.get(
  "/blogs/:id/edit",
  wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/edit", { blog });
  })
);

app.put(
  "/blogs/:id",
  validateBlog,
  wrapAsync(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body.blog, {
      new: true,
    });
    res.redirect(`/blogs/${blog.id}`);
  })
);

// DELETE route
app.delete(
  "/blogs/:id",
  wrapAsync(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
  })
);

app.all("*", (req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  res.status(statusCode).render("error", { error });
});

// Put the PORT number in env
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
