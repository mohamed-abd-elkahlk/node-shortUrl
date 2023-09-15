const multer = require("multer");
const ApiError = require("../utils/utiles");

const mutlerOpt = () => {
  const storage = multer.memoryStorage();
  const filter = (req, file, cb) => {
    if (file.mimeType.startWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("onley image alllowed", 400));
    }
  };
  const upload = multer({ storage, fileFilter: filter });
  return upload;
};

const uploadSingleImage = (fildName) => mutlerOpt().single(fildName);
module.exports = uploadSingleImage;
