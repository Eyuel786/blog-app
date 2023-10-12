if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const fs = require("fs");
const flash = require("connect-flash");
const AppError = require("./utils/AppError");
const User = require("./models/User");

const blogsRouters = require("./routers/blogs.routers");
const userRouters = require("./routers/user.routers");
const commentsRouters = require("./routers/comments.routers");

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

mongoose
  .connect(MONGO_URL)
  .catch(console.error.bind(console, "Initial DB connection error:"));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB connection error"));
db.once("open", () => console.log("Database connected"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRouters);
app.use("/blogs", blogsRouters);
app.use("/blogs/:id/comments", commentsRouters);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Couldn't delete file");
      }
    });
  }
  const { statusCode = 500 } = error;
  res.status(statusCode).render("error", { error });
});

app.listen(PORT, () => {
  console.log("Server is running");
});
