import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
});

const removeUploadedFile = async (file) => {
  if (file?.path) await fs.unlink(file.path).catch(() => {});
};

const removeOldProfileImage = async (imagePath) => {
  if (!imagePath?.startsWith("/uploads/")) return;
  await fs.unlink(path.resolve("uploads", path.basename(imagePath))).catch(() => {});
};

export async function register(request, response, next) {
  try {
    const { name, email, password, confirmPassword, role } = request.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "All fields are required." });
    }
    if (!request.file) return response.status(400).json({ message: "Profile image is required." });
    if (!["user", "admin"].includes(role)) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Invalid account role." });
    }
    if (password.length < 6) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (password !== confirmPassword) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Passwords do not match." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      await removeUploadedFile(request.file);
      return response.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      image: `/uploads/${request.file.filename}`,
    });

    return response.status(201).json({ message: "Account created successfully.", user: publicUser(user) });
  } catch (error) {
    await removeUploadedFile(request.file);
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password, role } = request.body;
    if (!email || !password || !role) return response.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.trim().toLowerCase(), role }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ message: "Invalid email or password for this account type." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return response.json({ message: "Signed in successfully.", token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(request, response, next) {
  try {
    const { name, email, currentPassword, newPassword, confirmPassword } = request.body;
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Name must be between 2 and 80 characters." });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Enter a valid email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail, _id: { $ne: request.user._id } })) {
      await removeUploadedFile(request.file);
      return response.status(409).json({ message: "An account with this email already exists." });
    }

    const changingPassword = Boolean(currentPassword || newPassword || confirmPassword);
    if (changingPassword) {
      if ([currentPassword, newPassword, confirmPassword].some((value) => typeof value !== "string" || !value)) {
        await removeUploadedFile(request.file);
        return response.status(400).json({ message: "Enter your current password and both new password fields." });
      }
      if (newPassword.length < 6) {
        await removeUploadedFile(request.file);
        return response.status(400).json({ message: "New password must be at least 6 characters." });
      }
      if (newPassword !== confirmPassword) {
        await removeUploadedFile(request.file);
        return response.status(400).json({ message: "New password fields do not match." });
      }
    }

    const user = await User.findById(request.user._id).select("+password");
    if (!user) {
      await removeUploadedFile(request.file);
      return response.status(404).json({ message: "Account no longer exists." });
    }
    if (changingPassword && !(await bcrypt.compare(currentPassword, user.password))) {
      await removeUploadedFile(request.file);
      return response.status(400).json({ message: "Current password is incorrect." });
    }

    const oldImage = user.image;
    user.name = name.trim();
    user.email = normalizedEmail;
    if (request.file) user.image = `/uploads/${request.file.filename}`;
    if (changingPassword) user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    if (request.file && oldImage !== user.image) await removeOldProfileImage(oldImage);
    return response.json({ message: "Profile updated successfully.", user: publicUser(user) });
  } catch (error) {
    await removeUploadedFile(request.file);
    if (error.code === 11000) return response.status(409).json({ message: "An account with this email already exists." });
    next(error);
  }
}
