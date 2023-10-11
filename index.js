const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const Blog = require("./models/Blog");
const wrapAsync = require("./utils/wrapAsync");
const AppError = require("./utils/AppError");
const {
  validateBlog,
  isLoggedIn,
  isBlogAuthor,
  validateComment,
} = require("./utils/middlewares");
const User = require("./models/User");
const Comment = require("./models/Comment");

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

app.use(
  session({
    secret: "mySEcREtteXT",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/blog-app",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// INDEX route
app.get(
  "/blogs",
  wrapAsync(async (req, res) => {
    const blogs = await Blog.find({})
      .populate({
        path: "author",
        select: "username email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email",
        },
      });
    res.render("blogs/index", { blogs });
  })
);

// POST route
app.post(
  "/blogs",
  isLoggedIn,
  validateBlog,
  wrapAsync(async (req, res) => {
    const blog = new Blog(req.body.blog);
    blog.author = req.user;
    await blog.save();
    res.redirect(`/blogs/${blog.id}`);
  })
);

app.get("/blogs/new", isLoggedIn, (req, res) => {
  res.render("blogs/new");
});

// SHOW route
app.get(
  "/blogs/:id",
  wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "author",
        select: "username email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email",
        },
      });
    res.render("blogs/show", { blog, allowComment: false });
  })
);

// UPDATE route
app.get(
  "/blogs/:id/edit",
  isLoggedIn,
  isBlogAuthor,
  wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/edit", { blog });
  })
);

app.put(
  "/blogs/:id",
  isLoggedIn,
  isBlogAuthor,
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
  isLoggedIn,
  isBlogAuthor,
  wrapAsync(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
  })
);

// USER
// REGISTER ROUTE
app.get("/register", (req, res) => {
  res.render("user/register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (error) => {
      if (error) return next(error);
      res.redirect("/blogs");
    });
  } catch (error) {
    res.redirect("/register");
  }
});

// LOGIN
app.get("/login", (req, res) => {
  res.render("user/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || "/blogs";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// LOGOUT
app.get("/logout", (req, res) => {
  req.logout((error) => {
    if (error) return next(error);
    res.redirect("/blogs");
  });
});

// COMMENT
// ADD COMMENT
app.get(
  "/blogs/:id/comments",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "author",
        select: "username email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email",
        },
      });
    res.render("blogs/show", { blog, allowComment: true });
  })
);

app.post(
  "/blogs/:id/comments",
  isLoggedIn,
  validateComment,
  wrapAsync(async (req, res) => {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    const comment = new Comment(req.body.comment);
    comment.author = req.user;
    blog.comments.push(comment);
    await Promise.all([blog.save(), comment.save()]);
    res.redirect(`/blogs/${blogId}`);
  })
);

// DELETE COMMENT
app.delete(
  "/blogs/:id/comments/:commentId",
  wrapAsync(async (req, res) => {
    const { id: blogId, commentId } = req.params;
    await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { comments: commentId } },
      { new: true, runValidators: true }
    );
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/blogs/${blogId}`);
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
