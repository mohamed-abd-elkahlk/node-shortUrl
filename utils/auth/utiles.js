const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privKeyPath = path.join(__dirname, "../../id_rsa_priv.pem");
const pupKeyPath = path.join(__dirname, "../../id_rsa_pup.pem");

const PRIV_KEY = fs.readFileSync(privKeyPath, "utf-8");
const PUP_KEY = fs.readFileSync(pupKeyPath, "utf-8");

const genHash = (password) => {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return {
    hash,
    salt,
  };
};

const verifyPasswordHash = (password, salt, hash) => {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return hash === hashVerify;
};

const issueJWT = (user) => {
  const id = user._id;
  const expiresIn = "5d";
  const { role } = user;

  const payload = {
    sub: id,
    role,
    iat: Date.now(),
  };

  const token = jwt.sign(payload, PRIV_KEY, { algorithm: "RS256", expiresIn });

  return token;
};

const varifyToken = (jwtToken) => {
  const decoded = jwt.verify(jwtToken, PUP_KEY);
  return decoded;
};

const generateMagicLink = (email) => {
  const token = jwt.sign({ email }, PRIV_KEY, {
    algorithm: "RS256",
    expiresIn: "1h",
  });
  return `${process.env.BASE_URL}/auth/verify?token=${token}`;
};
module.exports = {
  genHash,
  varifyToken,
  issueJWT,
  verifyPasswordHash,
  generateMagicLink,
};
