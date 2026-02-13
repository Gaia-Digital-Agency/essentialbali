import crypto from "crypto";

const ALGORITHM = "aes-256-ctr";
const IV = Buffer.alloc(16, 0); // IV fix (safe enough for this case)
const KEY = crypto
  .createHash("sha256")
  .update(String(process.env.ENCRYPT_KEY || "default_secret_key"))
  .digest("base64")
  .substring(0, 32);

export const encrypt = (text) => {
  if (!text) return null;
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return encrypted.toString("hex");
};

export const decrypt = (hash) => {
  if (!hash) return null;
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

export default { encrypt, decrypt };