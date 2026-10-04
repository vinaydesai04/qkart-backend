const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else,
 *  - Return the whole user object fetched from Mongo
 *
 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 * 
 * @returns {User | {address: String}}
 */
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  
  if (user.email !== req.user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not found");
  }

  // Handle ?q=address query parameter
  if (req.query.q === "address") {
    return res.send({
      address: user.address,
    });
  }

  // Return full user object by default
  res.send(user);
});

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email !== req.user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not found");
  }

  const result = await userService.setAddress(user, req.body.address);

  res.send({
    address: result.address ? result.address : result, // Safely handles either user object or string returned from service
  });
});

module.exports = {
  getUser,
  setAddress,
};