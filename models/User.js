const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
