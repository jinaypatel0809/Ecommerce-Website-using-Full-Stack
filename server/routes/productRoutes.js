import { Router } from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct, updateProductBestSeller, updateProductDeal, updateProductNewLaunch, updateProductPopular, updateProductUpcoming } from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.patch("/:id/deal", protect, adminOnly, updateProductDeal);
router.patch("/:id/best-seller", protect, adminOnly, updateProductBestSeller);
router.patch("/:id/popular", protect, adminOnly, updateProductPopular);
router.patch("/:id/new-launch", protect, adminOnly, updateProductNewLaunch);
router.patch("/:id/upcoming", protect, adminOnly, updateProductUpcoming);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
