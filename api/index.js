const express = require("express");

// init app enviroment varibals
require("dotenv").config({
  path: "./.env",
});
const passprot = require("passport");
const cookiesParser = require("cookie-parser");

const cors = require("cors");
const app = express();
const expressAsyncHandler = require("express-async-handler");
const shortUrlRoutes = require("../routes/url.routes");
const userRoutes = require("../routes/user.routes");
const authRoutes = require("../routes/auth.routes");
const globalError = require("../middleware/Error");

// database connect
const dbConnection = require("../config/db.connection");

dbConnection();

// this middlwere used to log out the http requst
// app.use(morgan("dev"));
// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.CLINT_URL],
//   })
// );

// mildllwere to help us to recive requst
app.use(express.json());
passprot.use(require("../config/passport"));

app.use(cookiesParser());
app.use(express.urlencoded({ extended: true }));
app.use(passprot.initialize());
// routes
const ShortUrl = require("../modules/urls");
const { ApiError } = require("../utils/utiles");

app.use("/api/shorturl", shortUrlRoutes);

app.use("/api/user", userRoutes);

app.use("/api/auth", authRoutes);

app.get(
  "/s/:shortUrl",
  expressAsyncHandler(async (req, res, next) => {
    const { shortUrl } = req.params;
    const url = await ShortUrl.findOne({
      short_url: `${process.env.BASE_URL}/s/${shortUrl}`,
    });
    if (!url) {
      return next(
        new ApiError(
          `no short url with this value : ${process.env.BASE_URL}/${shortUrl}`
        )
      );
    }
    const updateUrl = await ShortUrl.findByIdAndUpdate(
      url._id,
      { $inc: { clikes: 1 } },
      { new: true }
    );
    res.redirect(url.long_url);
  })
);

// handel all routes that does no exits
app.all("*", (req, res) => {
  res.status(404).json({ error: `cant find this route:${req.originalUrl}` });
});
// global error handleing
app.use(globalError);

// TODO: make error for prodction mode
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`app run on: http://localhost:${port}`);
});
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err.name} | ${err.message} `);
  server.close(() => {
    console.error(`Shtuing down....`);
    process.exit(1);
  });
});

module.exports = app;
