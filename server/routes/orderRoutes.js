import { Router } from "express";
import { cancelMyOrder, createPaymentOrder, getAdminOrders, getMyOrders, updateOrderStatus, verifyPayment } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.post("/checkout", protect, createPaymentOrder);
router.get("/", protect, getMyOrders);
router.post("/:orderId/cancel", protect, cancelMyOrder);
router.post("/:orderId/verify", protect, verifyPayment);
router.get("/admin", protect, adminOnly, getAdminOrders);
router.patch("/admin/:orderId/status", protect, adminOnly, updateOrderStatus);

export default router;
