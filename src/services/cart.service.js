const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({ email: user.email }).populate("cartItems.product");
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return cart;
};

/**
 * Adds a new product to cart
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
 const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    try {
      cart = await Cart.create({
        email: user.email,
        cartItems: [],
        paymentOption: "PAYMENT_OPTION_DEFAULT"
      });
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Cart creation failed");
    }
    // Safely catch the mock unit test resolving to null
    if (!cart) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Cart creation failed");
    }
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  if (!cart.cartItems) {
    cart.cartItems = [];
  }

  const productIndex = cart.cartItems.findIndex((item) => {
    if (!item.product) return false;
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId === productId;
  });

  if (productIndex !== -1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }

  cart.cartItems.push({ product, quantity });
  await cart.save();
  return cart.populate("cartItems.product");
};

/**
 * Updates the quantity of an already existing product in cart
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  if (!cart.cartItems) {
    cart.cartItems = [];
  }

  const productIndex = cart.cartItems.findIndex((item) => {
    if (!item.product) return false;
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId === productId;
  });

  if (productIndex === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  cart.cartItems[productIndex].quantity = quantity;
  await cart.save();
  return cart.populate("cartItems.product");
};

/**
 * Deletes an already existing product in cart
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  if (!cart.cartItems) {
    cart.cartItems = [];
  }

  const productIndex = cart.cartItems.findIndex((item) => {
    if (!item.product) return false;
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId === productId;
  });

  if (productIndex === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  cart.cartItems.splice(productIndex, 1);
  await cart.save();
};

/**
 * Checkout a user's cart.
 * On success, returns the cart object.
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
 const checkout = async (user) => {
  const cart = await Cart.findOne({ email: user.email }).populate("cartItems.product");

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }

  if (cart.cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have products in the cart");
  }

  const hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User has not set an address");
  }

  // Calculate total cost
  let totalCost = 0;
  cart.cartItems.forEach((item) => {
    totalCost += item.product.cost * item.quantity;
  });

  if (user.walletMoney < totalCost) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have sufficient balance");
  }

  // Deduct balance and save user
  user.walletMoney -= totalCost;
  await user.save();

  // Empty the cart and save
  cart.cartItems = [];
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};