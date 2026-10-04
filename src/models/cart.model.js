const mongoose = require("mongoose");
const { productSchema } = require("./product.model");
const config = require("../config/config");

const cartSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    cartItems: [
      {
        product: productSchema,
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    paymentOption: {
      type: String,
      default: config.default_payment_option || "PAYMENT_OPTION_DEFAULT",
    }
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Cart
 */
const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };