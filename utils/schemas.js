const Joi = require("joi");

module.exports.blogSchema = Joi.object({
  title: Joi.string().required(),
  subtitle: Joi.string().required(),
  content: Joi.string().required(),
});

module.exports.commentSchema = Joi.object({
  content: Joi.string().required(),
});

const passwordPattern = new RegExp(
  "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{7,16}"
);

module.exports.userSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(passwordPattern).required(),
});
