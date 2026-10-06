import crypto from "node:crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured on the server.");
    error.status = 503;
    throw error;
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
};

const validateAddress = (address) => {
  const fields = ["name", "phone", "line1", "city", "state", "postalCode"];
  if (!address || fields.some((field) => typeof address[field] !== "string" || !address[field].trim())) {
    return "Enter your name, phone, address, city, state and PIN code.";
  }
  if (address.line2 !== undefined && typeof address.line2 !== "string") return "Address line 2 must be text.";
  if (!/^\+?[0-9\s()-]{7,20}$/.test(address.phone.trim())) return "Enter a valid phone number.";
  if (!/^\d{6}$/.test(address.postalCode.trim())) return "Enter a valid 6-digit PIN code.";
  if (["name", "city", "state"].some((field) => address[field].trim().length > 80)) {
    return "Name, city and state must be 80 characters or fewer.";
  }
  if (address.line1.trim().length > 160 || (address.line2 && address.line2.trim().length > 160)) {
    return "Address lines must be 160 characters or fewer.";
  }
  return null;
};

export async function createPaymentOrder(request, response, next) {
  try {
    const addressError = validateAddress(request.body.address);
    if (addressError) return response.status(400).json({ message: addressError });

    const cart = await Cart.findOne({ user: request.user._id }).populate("items.product");
    if (!cart?.items.length) return response.status(400).json({ message: "Your cart is empty." });

    const items = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) return response.status(400).json({ message: "A product in your cart is no longer available. Update your cart and try again." });
      if (product.stock < item.quantity) {
        return response.status(409).json({ message: `${product.name} has only ${product.stock} item(s) available. Update your cart and try again.` });
      }
      items.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amount = Math.round(total * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return response.status(400).json({ message: "The order total must be at least ₹1." });
    }

    const { client, keyId } = getRazorpay();
    const receipt = new mongoose.Types.ObjectId().toString();
    const razorpayOrder = await client.orders.create({ amount, currency: "INR", receipt });
    const address = request.body.address;
    const order = await Order.create({
      _id: receipt,
      user: request.user._id,
      customer: {
        name: address.name.trim(),
        email: request.user.email,
        phone: address.phone.trim(),
      },
      address: {
        line1: address.line1.trim(),
        line2: typeof address.line2 === "string" ? address.line2.trim() : "",
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
      },
      items,
      total,
      razorpayOrderId: razorpayOrder.id,
    });

    response.status(201).json({
      orderId: order.id,
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      customer: order.customer,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(request, response, next) {
  try {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body;
    if (![razorpayOrderId, paymentId, signature].every((value) => typeof value === "string" && value)) {
      return response.status(400).json({ message: "Payment verification details are incomplete." });
    }

    const order = await Order.findOne({ _id: request.params.orderId, user: request.user._id });
    if (!order) return response.status(404).json({ message: "Order not found." });
    if (order.status === "paid" || ["processing", "shipped", "delivered"].includes(order.status)) {
      if (order.razorpayPaymentId !== paymentId) return response.status(409).json({ message: "This order was already paid using a different payment." });
      return response.json({ message: "Payment already verified.", orderId: order.id });
    }
    if (order.status !== "payment_pending" || order.razorpayOrderId !== razorpayOrderId) {
      return response.status(400).json({ message: "Payment order does not match this checkout." });
    }

    const { client, keySecret } = getRazorpay();
    if (!/^[a-f\d]{64}$/i.test(signature)) return response.status(400).json({ message: "Payment signature is invalid." });
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
    const supplied = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return response.status(400).json({ message: "Payment signature verification failed." });
    }

    let payment = await client.payments.fetch(paymentId);
    if (payment.order_id !== razorpayOrderId || payment.amount !== Math.round(order.total * 100) || payment.currency !== order.currency) {
      return response.status(400).json({ message: "Payment details do not match the order." });
    }
    if (payment.status === "authorized") {
      payment = await client.payments.capture(paymentId, payment.amount, payment.currency);
    }
    if (payment.status !== "captured") {
      return response.status(409).json({ message: "Payment has not been captured. Please try again or contact support." });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({ _id: order._id, user: request.user._id }).session(session);
        if (!currentOrder) {
          const missingOrder = new Error("Order not found.");
          missingOrder.status = 404;
          throw missingOrder;
        }
        if (currentOrder.status !== "payment_pending") {
          if (currentOrder.razorpayPaymentId === paymentId) return;
          const alreadyPaid = new Error("This order was already processed with a different payment.");
          alreadyPaid.status = 409;
          throw alreadyPaid;
        }

        for (const item of currentOrder.items) {
          const result = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session },
          );
          if (result.modifiedCount !== 1) {
            const shortage = new Error(`${item.name} is no longer available in the requested quantity.`);
            shortage.code = "INSUFFICIENT_STOCK";
            throw shortage;
          }
        }

        currentOrder.status = "paid";
        currentOrder.razorpayPaymentId = paymentId;
        currentOrder.paidAt = new Date();
        await currentOrder.save({ session });

        const cart = await Cart.findOne({ user: request.user._id }).session(session);
        if (cart) {
          const purchased = new Map(currentOrder.items.map((item) => [item.product.toString(), item.quantity]));
          cart.items = cart.items.flatMap((item) => {
            const purchasedQuantity = purchased.get(item.product.toString()) || 0;
            if (purchasedQuantity >= item.quantity) return [];
            if (purchasedQuantity > 0) item.quantity -= purchasedQuantity;
            return [item];
          });
          await cart.save({ session });
        }
      });
    } catch (transactionError) {
      if (transactionError.code !== "INSUFFICIENT_STOCK") throw transactionError;

      try {
        const refund = await client.payments.refund(paymentId, {
          amount: payment.amount,
          notes: { reason: "Inventory became unavailable before order confirmation." },
        });
        await Order.updateOne(
          { _id: order._id, status: "payment_pending" },
          { $set: { status: "refund_pending", razorpayPaymentId: paymentId, razorpayRefundId: refund.id } },
        );
        return response.status(409).json({ message: "Stock ran out during payment. A refund has been initiated; please check with your bank for the credit." });
      } catch (refundError) {
        await Order.updateOne(
          { _id: order._id, status: "payment_pending" },
          { $set: { status: "payment_review", razorpayPaymentId: paymentId } },
        );
        console.error("Automatic refund failed for order:", order.id, refundError.message);
        return response.status(502).json({ message: "Payment was received but stock ran out. Your payment is under review; please contact support with your order ID." });
      }
    } finally {
      await session.endSession();
    }

    response.json({ message: "Payment verified and order placed successfully.", orderId: order.id });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Order not found." });
    next(error);
  }
}

export async function getAdminOrders(_request, response, next) {
  try {
    const orders = await Order.find({ status: { $ne: "payment_pending" } }).sort({ createdAt: -1 }).limit(200);
    response.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(request, response, next) {
  try {
    const orders = await Order.find({
      user: request.user._id,
      status: { $ne: "payment_pending" },
    }).sort({ createdAt: -1 }).limit(100);
    response.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function cancelMyOrder(request, response, next) {
  let session;
  try {
    session = await mongoose.startSession();
    let orderToReturn;
    let alreadyRequested = false;
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: request.params.orderId,
        user: request.user._id,
        status: { $in: ["paid", "processing"] },
      }).session(session);

      if (!order) {
        const existingOrder = await Order.findOne({
          _id: request.params.orderId,
          user: request.user._id,
        }).session(session);
        if (!existingOrder) {
          const notFound = new Error("Order not found.");
          notFound.status = 404;
          throw notFound;
        }
        if (existingOrder.status === "refund_pending") {
          orderToReturn = existingOrder;
          alreadyRequested = true;
          return;
        }
        const cannotCancel = new Error("Orders can only be cancelled before they are shipped.");
        cannotCancel.status = 409;
        throw cannotCancel;
      }

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session },
        );
        if (result.modifiedCount !== 1) {
          const unavailableProduct = new Error(`Could not restore stock for ${item.name}. Please contact support.`);
          unavailableProduct.status = 409;
          throw unavailableProduct;
        }
      }

      order.status = "refund_pending";
      await order.save({ session });
      orderToReturn = order;
    });

    response.json({
      message: alreadyRequested
        ? "Cancellation is already recorded. Your refund is pending manual processing."
        : "Order cancelled. Your refund is pending manual processing.",
      order: orderToReturn,
    });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Order not found." });
    next(error);
  } finally {
    if (session) await session.endSession();
  }
}

export async function updateOrderStatus(request, response, next) {
  try {
    const { status } = request.body;
    const transitions = { placed: "processing", paid: "processing", processing: "shipped", shipped: "delivered", refund_pending: "refunded" };
    const order = await Order.findById(request.params.orderId);
    if (!order) return response.status(404).json({ message: "Order not found." });
    if (transitions[order.status] !== status) {
      return response.status(400).json({ message: "This order cannot be moved to the requested status." });
    }

    const updates = { status };
    if (status === "refunded") updates.refundedAt = new Date();
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!updatedOrder) return response.status(409).json({ message: "Order status changed. Refresh and try again." });
    response.json({ message: `Order marked as ${status}.`, order: updatedOrder });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Order not found." });
    next(error);
  }
}
