const mongoose = require("mongoose");
const { genHash } = require("../utils/auth/utiles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name reqired !"],
    },
    email: {
      type: String,
      required: [true, "email reqired !"],
      // unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password reqired !"],
      minlength: [6, "passowrd must be grater than 6 crcter"],
    },
    salt: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    avater: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    urls: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "shorturl",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const password = genHash(this.password);
  this.password = password.hash;
  this.salt = password.salt;

  next();
});

userSchema.post("init", (doc) => {
  if (doc.avater) {
    const imageUrl = `${process.env.BASE_URL}/user/${doc.avater}`;
    doc.avater = imageUrl;
  }
});
userSchema.post("save", (doc) => {
  if (doc.avater) {
    const imageUrl = `${process.env.BASE_URL}/user/${doc.avater}`;
    doc.avater = imageUrl;
  }
});

const User = mongoose.model("user", userSchema);

module.exports = User;
