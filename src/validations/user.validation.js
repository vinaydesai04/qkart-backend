const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  // Allow optional query params like ?q=address
  query: Joi.object().keys({
    q: Joi.string(),
  }),
};

const setAddress = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    // Enforce that address is provided and at least 20 characters long
    address: Joi.string().required().min(20),
  }),
};

module.exports = {
  getUser,
  setAddress,
};
