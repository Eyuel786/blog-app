const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: String,
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);

module.exports = model("User", userSchema);
