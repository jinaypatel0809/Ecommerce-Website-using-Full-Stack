export default function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error.code === "LIMIT_FILE_SIZE") return response.status(413).json({ message: "Image must be smaller than 5 MB." });
  if (error.code === 11000) return response.status(409).json({ message: "Email is already registered." });
  // Razorpay SDK errors carry the gateway's own statusCode (401 = bad API keys). That is NOT the
  // shopper's login session, so don't forward it as 401/403 or the client would log the user out.
  if (error.error && typeof error.error === "object" && [401, 403].includes(error.statusCode)) {
    return response.status(502).json({
      message: "Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env (a matching pair from the same mode), then restart the server.",
    });
  }
  const status = error.status || error.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 600) {
    const message = error.error?.description || error.message || "Request failed.";
    return response.status(status).json({ message });
  }
  return response.status(500).json({ message: error.message || "Internal server error." });
}
