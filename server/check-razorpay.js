// Run:  node check-razorpay.js   (inside the server folder)
// Tests the keys in server/.env directly against Razorpay. Does not change anything.
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config({ override: true });
const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

console.log("Key ID loaded   :", keyId ? `${keyId.slice(0, 13)}...${keyId.slice(-3)}  (length ${keyId.length}, expected 23)` : "NOT SET");
console.log("Secret loaded   :", keySecret ? `length ${keySecret.length} (expected 24)` : "NOT SET");
console.log("Mode            :", keyId.startsWith("rzp_test_") ? "TEST" : keyId.startsWith("rzp_live_") ? "LIVE" : "UNKNOWN");
if (/\s|["']/.test(keyId + keySecret)) console.log("WARNING         : a space or quote character is inside the key/secret");

try {
  const client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  await client.orders.all({ count: 1 });
  console.log("\nRESULT: OK - Razorpay accepted these keys.");
} catch (error) {
  console.log("\nRESULT: FAILED");
  console.log("HTTP status :", error.statusCode ?? "(none)");
  console.log("Razorpay says:", error.error?.description || error.message || error);
  if (!error.statusCode) console.log("No HTTP status means the request never reached Razorpay: check your internet/firewall/VPN.");
}
