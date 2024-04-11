const crypto = require("crypto");
const mongoose = require("mongoose");

const UrlShema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: [true, "name required"],
      minlength: [3, "name must be grater than 3 crcter"],
    },
    long_url: {
      type: String,
      required: [true, "you must provide a url "],
    },
    short_url: {
      type: String,
      unique: true,
    },
    salt: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [false, "url must belong to user"],
      ref: "user",
    },
    clikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const generateShortUrl = (longUrl, salt) => {
  // Get the MD5 hash of the long URL with salt.
  const hash = crypto.createHash("md5");
  hash.update(longUrl + salt);
  const hashvlaue = hash.digest("hex");
  // Convert the MD5 hash value to a short URL.
  const shortUrl = hashvlaue.slice(0, 8);
  return shortUrl;
};

UrlShema.pre("save", function (next) {
  // Gnereate salt
  const salt = crypto.randomBytes(8).toString("hex");

  const hashUrl = generateShortUrl(this.long_url, salt);
  this.short_url = `${process.env.BASE_URL}/s/${hashUrl}`;
  this.salt = salt;
  next();
});
const ShortUrl = mongoose.model("shorturl", UrlShema);

module.exports = ShortUrl;
