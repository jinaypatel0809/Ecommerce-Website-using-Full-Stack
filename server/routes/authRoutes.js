import { Router } from "express";
import { login, register, updateProfile } from "../controllers/authController.js";
import { protect, userOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.patch("/profile", protect, userOnly, upload.single("image"), updateProfile);

export default router;
