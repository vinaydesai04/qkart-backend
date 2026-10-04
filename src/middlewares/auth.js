const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  // If there's an error, missing user, or token info issue (like expired), reject!
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
  }
  req.user = user;
  resolve();
};

const auth = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject)
    )(req, res, (err) => {
      // Catch any unexpected passport errors so it doesn't hang
      if (err) return reject(err);
      resolve();
    });
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;