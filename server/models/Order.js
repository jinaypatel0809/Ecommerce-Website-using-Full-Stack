import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    address: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      enum: ["payment_pending", "placed", "paid", "processing", "shipped", "delivered", "refund_pending", "refunded", "payment_review"],
      default: "payment_pending",
      index: true,
    },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, default: null },
    razorpayRefundId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
