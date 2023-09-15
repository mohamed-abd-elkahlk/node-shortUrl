const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const uploadSingleImage = require("../middleware/image");
const User = require("../modules/user");

const factory = require("./handler.service");
const { ApiError } = require("../utils/utiles");
const { genHash, issueJWT } = require("../utils/auth/utiles");

const uplaodUserImage = uploadSingleImage("profileImg");

const resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    // TODO: add image path
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${fileName}`);
  }
  req.body.profileImg = fileName;
  next();
});

// onley admins can do this five below
const createUser = factory.createOne(User);

const getAllUsers = factory.getAll(User);

const getOneUser = factory.getOne(User);

const deleteUser = factory.deleteOne(User);

const updateUser = factory.updateOne(User);

// servise for normal user
const getMe = asyncHandler(async (req, res, next) => {
  // 1) Build query
  const user = await User.findById(req.user._id);

  // 2) Execute query

  if (!user) {
    return next(new ApiError(`no user with this id :${req.user._id}`, 404));
  }
  res.status(200).json({ data: user });
});

const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

const updateLoggedUserDate = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      email: req.body.email,
      name: req.body.name,
      avatar: req.body.profileImg,
    },
    { new: true }
  );
  res.status(200).json({ data: user });
});

const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) {
    return next(new ApiError("password reqired", 404)); //TODO nead to know what status code to put here
  }
  const passwordhash = genHash(req.body.password);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: passwordhash.hash,
      salt: passwordhash.salt,
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`try to log in`, 404));
  }
  const token = issueJWT(user);

  res
    .status(200)
    .cookie("jwt", token, { httpOnly: true, sameSite: "strict" })
    .json({ data: user, token });
});

const disableLogedUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).clearCookie("jwt");
});

module.exports = {
  uplaodUserImage,
  resizeImage,
  createUser,
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUser,
  updateLoggedUserDate,
  updateLoggedUserPassword,
  disableLogedUser,
  getMe,
  getLoggedUserData,
};
