import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], required: true },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
