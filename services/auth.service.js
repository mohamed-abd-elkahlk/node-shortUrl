const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const { ApiError } = require("../utils/utiles");

const User = require("../modules/user");
const {
  issueJWT,
  verifyPasswordHash,
  varifyToken,
  generateMagicLink,
} = require("../utils/auth/utiles");
const sendEmail = require("../utils/email/utiles");

const signup = asyncHandler(async (req, res, next) => {
  const user = User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const magicLink = generateMagicLink(req.body.email);

  const message = `
  <html>
<head>
  <title>Verify Your Signup</title>
</head>
<body>
  <h1>Verify Your Signup</h1>
  <p>Hi ${req.body.name},</p>
  <p>Thank you for signing up for our service!</p>
  <p>To verify your signup, please click on the following link:</p>
  <a href=${magicLink}>verify</a>
  <p>This link will only be valid for 1 hour.</p>
  <p>Thanks,</p>
  <p>The team at shout url</p>
</body>
</html>
  `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "verify your signup",
      message,
    });

    res.status(201).json({
      succes: true,
      emial: `cheke your inbox for this email ${req.body.email}`,
    });
  } catch (err) {
    return next(new ApiError(err, 500));
  }
});

const varifySignup = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  try {
    const decodedToken = varifyToken(token);
    if (decodedToken) {
      console.log(decodedToken);
    }
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return new ApiError("User not found", 401);
    }

    user.isVerified = true;
    // console.log(decodedToken);
    await user.save();

    res.status(200).json({ succes: true, message: `email varify` });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

const login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  const verifyPassword = verifyPasswordHash(
    req.body.password,
    user.salt,
    user.password
  );
  if (!verifyPassword) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  if (!user.isVerified) {
    return next(new ApiError("user not varfied", 401));
  }

  const token = issueJWT(user);

  // Delete password from response
  delete user._doc.password;
  delete user._doc.salt;
  // send response to client side
  res.status(200).json({ data: user, token });
});
const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = ```
  <html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>resetCode</title>
</head>

<body>
    <h1>rest code</h1>
    <p>Hi ${user.name} <br> We received a request to reset the password on your Short url Account.</p>
    <p>${resetCode} <br> Enter this code to complete the reset.</p>
    <p>Thanks for helping us keep your account secure. <br> The Short url Team</p>
</body>

</html>
  ```;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = issueJWT(user);
  res
    .status(200)
    .cookie("jwt", token, { httpOnly: true, sameSite: "strict" })
    .json({ token });
});

const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return new ApiError("you are not loged in so you can't logout");
  }
  res
    .clearCookie("jwt")
    .status(200)
    .json({ succes: true, message: "you logout" });
});

module.exports = {
  resetPassword,
  varifySignup,
  signup,
  login,
  allowedTo,
  forgotPassword,
  verifyPassResetCode,
  logout,
};
