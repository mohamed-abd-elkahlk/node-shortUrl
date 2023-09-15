const router = require("express").Router();
const passport = require("passport");

const {
  createShortUrl,
  deleteShortUrl,
  getAllShortUrlsForUser,
  getshortUrlById,
  updateShortUrlForUser,
} = require("../services/url.service");
const { allowedTo } = require("../services/auth.service");
const {
  createUrlValidateor,
  deleteUrlValidateor,
  updateValidateor,
} = require("../utils/validation/url");

router.use(
  passport.authenticate("jwt", {
    session: false,
    ignoreExpiration: false,
    userProperty: "user",
  }),
  allowedTo("user")
);
router
  .route("/")
  .get(getAllShortUrlsForUser)
  .post(createUrlValidateor, createShortUrl);

router
  .route("/:id")
  .get(getshortUrlById)
  .put(updateValidateor, updateShortUrlForUser)
  .delete(deleteUrlValidateor, deleteShortUrl);

module.exports = router;
