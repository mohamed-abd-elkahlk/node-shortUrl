const fs = require("fs");
const path = require("path");
const JWTstrategy = require("passport-jwt").Strategy;
const User = require("../modules/user");

const pupKeyPath = path.join(__dirname, "../id_rsa_pup.pem");
const PUP_KEY = fs.readFileSync(pupKeyPath, "utf-8");

const cookiesExtractor = (req) => {
  let jwt;
  if (!req.cookies.jwt) {
    return (jwt = null);
  }

  return (jwt = req.cookies.jwt);
};

const strategy = new JWTstrategy(
  {
    jwtFromRequest: cookiesExtractor,
    secretOrKey: PUP_KEY,
    algorithms: ["RS256"],
  },
  (payload, done) => {
    User.findById(payload.sub)
      .then((user) => {
        if (!user) {
          return done(new Error("user not found try to register"), false);
        }
        return done(null, user);
      })
      .catch((err) => done(err, false));
  }
);
module.exports = strategy;
