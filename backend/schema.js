const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string().valid().required(),
    guests: Joi.number().integer().min(1).required(),
    bedrooms: Joi.number().integer().min(1).required(),
    beds: Joi.number().integer().min(1).required(),
    baths: Joi.number().integer().min(1).required(),
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required().max(500),
    rating: Joi.number().integer().min(1).max(5).required(),
  }).required(),
});