const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const generateKey = crypto.generateKeyPairSync("rsa", {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

if (!fs.existsSync("./.env")) {
  fs.mkdirSync("./.env");
}
const publickeyPath = path.join(__dirname, "./.env/id_rsa_pup.pem");
const privtekeyPath = path.join(__dirname, "./.env/id_rsa_priv.pem");

fs.writeFileSync(publickeyPath, generateKey.publicKey);

fs.writeFileSync(privtekeyPath, generateKey.privateKey);
