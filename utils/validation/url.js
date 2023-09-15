const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validator");
const User = require("../../modules/user");
const ShortUrl = require("../../modules/urls");

exports.createUrlValidateor = [
  check("name").notEmpty().isLength({ min: 3 }),
  check("long_url").notEmpty().isURL().withMessage("invalide url"),
  validatorMiddleware,
];

exports.updateValidateor = [
  check("id")
    .notEmpty()
    .isMongoId()
    .custom((val, { req }) =>
      ShortUrl.findById(val).then((url) => {
        if (url.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
]; // TODO : contnue the valditors
exports.deleteUrlValidateor = [
  check("id")
    .notEmpty()
    .isMongoId()
    .custom((val, { req }) =>
      ShortUrl.findById(val).then((url) => {
        if (url.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];
