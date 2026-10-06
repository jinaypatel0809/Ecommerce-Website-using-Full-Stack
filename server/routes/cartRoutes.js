import { Router } from "express";
import { addToCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);

export default router;
