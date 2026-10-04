const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");

const router = express.Router();

router.get(
  "/:userId",
  auth, // <-- No parentheses here!
  validate(userValidation.getUser),
  userController.getUser
);

module.exports = router;