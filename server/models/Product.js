import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    brand: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, enum: ["Mobiles", "Fashion", "Electronics", "Headphones", "Neckband", "Men's Shoes", "Women's Shoes", "Men's Brazler", "Men's Shirts", "Women's Shirts", "Smart Watches", "Men's Watches", "Women's Watch"] },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, required: true },
    isDeal: { type: Boolean, default: false },
    dealExpiresAt: { type: Date, default: null },
    isBestSeller: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isNewLaunch: { type: Boolean, default: false },
    isUpcoming: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
