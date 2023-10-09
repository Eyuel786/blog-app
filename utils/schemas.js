const Joi = require("joi");

module.exports.blogSchema = Joi.object({
  title: Joi.string().required(),
  subtitle: Joi.string().required(),
  content: Joi.string().required(),
  image: Joi.string().required(),
});
