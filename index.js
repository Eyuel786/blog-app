const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Blog = require("./models/Blog");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/blog-app")
  .catch(console.error.bind(console, "Initial DB connection error:"));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB connection error"));
db.once("open", () => console.log("Database connected"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("HOME");
});
// INDEX route
app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find({});
  res.render("blogs/index", { blogs });
});
// POST route
app.post("/blogs", async (req, res) => {
  const blog = new Blog(req.body.blog);
  await blog.save();
  res.redirect(`/blogs/${blog.id}`);
});

app.get("/blogs/new", async (req, res) => {
  res.render("blogs/new");
});
// SHOW route
app.get("/blogs/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("blogs/show", { blog });
});
// UPDATE route
app.get("/blogs/:id/edit", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("blogs/edit", { blog });
});

app.put("/blogs/:id", async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body.blog, {
    new: true,
  });
  res.redirect(`/blogs/${blog.id}`);
});
// DELETE route
app.delete("/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/blogs");
});

// Put the PORT number in env
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
