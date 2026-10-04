const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

/**
 * Fetch the cart details
 */
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

/**
 * Add a product to cart
 */
const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  res.status(httpStatus.CREATED).send(cart);
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * - If updated quantity > 0, 
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated cart object
 * - If updated quantity == 0, 
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 * 
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 */
const updateProductInCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity > 0) {
    const cart = await cartService.updateProductInCart(
      req.user,
      productId,
      quantity
    );
    res.status(httpStatus.OK).send(cart);
  } else {
    await cartService.deleteProductFromCart(req.user, productId);
    res.status(httpStatus.NO_CONTENT).send();
  }
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
};