import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(request, response, next) {
  try {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) return response.status(401).json({ message: "Authentication required." });

    const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return response.status(401).json({ message: "Account no longer exists." });
    request.user = user;
    next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired session." });
  }
}

export function adminOnly(request, response, next) {
  if (request.user?.role !== "admin") return response.status(403).json({ message: "Admin access required." });
  next();
}

export function userOnly(request, response, next) {
  if (request.user?.role !== "user") return response.status(403).json({ message: "User account access required." });
  next();
}
