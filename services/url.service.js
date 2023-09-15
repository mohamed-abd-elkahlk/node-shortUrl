const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/utiles");
const ShortUrl = require("../modules/urls");
const User = require("../modules/user");
const factory = require("./handler.service");

exports.createShortUrl = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id;
  const url = await ShortUrl.create(req.body);
  if (!url) {
    return next(new ApiError("intrnal server error", 500));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { urls: url._id },
    },
    { new: true }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({ data: url });
});

exports.deleteShortUrl = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const url = await ShortUrl.findByIdAndDelete(id);
  if (!url) {
    return next(new ApiError(`no url with this id: ${id}`, 500));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { urls: id },
    },
    { new: true }
  );
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(204).send();
});

exports.getAllShortUrlsForUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id).select("urls").populate("urls");
  if (!user) {
    return next(new ApiError("user not found", 404));
  }
  res.status(200).json({
    data: user,
  });
});

exports.getshortUrlById = factory.getOne(ShortUrl);

exports.updateShortUrlForUser = factory.updateOne(ShortUrl);
