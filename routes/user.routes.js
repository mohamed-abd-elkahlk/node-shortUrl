const router = require("express").Router();

const passport = require("passport");
const { allowedTo } = require("../services/auth.service");
const {
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
} = require("../utils/validation/user");
const {
  createUser,
  deleteUser,
  getAllUsers,
  getLoggedUserData,
  resizeImage,
  updateLoggedUserPassword,
  updateUser,
  disableLogedUser,
  getMe,
  getOneUser,
  updateLoggedUserDate,
  uplaodUserImage,
} = require("../services/user.service");

router.use(
  passport.authenticate("jwt", {
    session: false,
    userProperty: "user",
    ignoreExpiration: false,
  })
);
router.get("/getme", getLoggedUserData, getMe);
router.patch("/change/Password", updateLoggedUserPassword);
router.put("/update", updateLoggedUserDate);
router.delete("/delete", disableLogedUser);

// TODO : make this route below work and enable the user to add image !
router.patch("/addimage", uplaodUserImage, resizeImage);

router.use(allowedTo("admin"));

router.patch(
  "/changePassword/:id",
  updateUserValidator,
  updateLoggedUserPassword
);

router.route("/").get(getAllUsers).post(createUserValidator, createUser);
router
  .route("/:id")
  .get(getOneUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
