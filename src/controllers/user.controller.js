const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - Return the whole user object fetched from Mongo
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
  // Fetch user data from the database
  const user = await userService.getUserById(req.params.userId);
  
  // 1. If data doesn't exist, throw 404
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  
  // 2. AUTHORIZATION: Check if the logged-in user is requesting their own data
  // req.user is set by your auth middleware
  if (req.user.email !== user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not found");
  }

  // 3. Handle specific request for address (used in later milestones)
  if (req.query.q === "address") {
    return res.send({ address: user.address });
  }

  // 4. Send the full user object with implicit 200 status
  res.send(user);
});

module.exports = {
  getUser,
};