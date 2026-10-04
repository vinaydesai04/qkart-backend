const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs"); // 1. Require bcryptjs
const config = require("../config/config");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  {
    timestamps: true,
  }
);

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

// 2. Add pre-save hook to hash password before saving to MongoDB
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password); // 3. Implement password comparison
};

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = { User };