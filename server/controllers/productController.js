import fs from "node:fs/promises";
import path from "node:path";
import Product from "../models/Product.js";

const removeImage = async (imagePath) => {
  if (!imagePath?.startsWith("/uploads/")) return;
  const filename = path.basename(imagePath);
  await fs.unlink(path.resolve("uploads", filename)).catch(() => {});
};

const allowedCategories = ["Mobiles", "Fashion", "Electronics", "Headphones", "Neckband", "Men's Shoes", "Women's Shoes", "Men's Brazler", "Men's Shirts", "Women's Shirts", "Smart Watches", "Men's Watches", "Women's Watch"];

const validateFields = ({ name, brand, category, price, originalPrice, rating, stock, description }) => {
  if (!name || !brand || !category || price === undefined || originalPrice === undefined || stock === undefined || !description) return "All product fields are required.";
  if (!allowedCategories.includes(category)) return "Invalid product category.";
  if ([price, originalPrice, rating ?? 0, stock].some((value) => Number.isNaN(Number(value)) || Number(value) < 0)) return "Price, rating and stock values must be valid positive numbers.";
  if (Number(rating ?? 0) > 5) return "Rating must be between 0 and 5.";
  return null;
};

const isValidImageUrl = (value) => {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export async function getProducts(request, response, next) {
  try {
    const filter = request.query.category ? { category: request.query.category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    response.json({ products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(request, response, next) {
  try {
    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });
    response.json({ product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function updateProductDeal(request, response, next) {
  try {
    const { isDeal, dealExpiresAt } = request.body;
    if (typeof isDeal !== "boolean") {
      return response.status(400).json({ message: "Deal status must be true or false." });
    }

    let expiry = null;
    if (isDeal) {
      expiry = new Date(dealExpiresAt);
      if (!dealExpiresAt || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        return response.status(400).json({ message: "Choose a deal expiry time in the future." });
      }
    }

    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });

    product.isDeal = isDeal;
    product.dealExpiresAt = expiry;
    await product.save();
    response.json({ message: isDeal ? "Product added to Deals of the Day." : "Product removed from Deals of the Day.", product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function updateProductBestSeller(request, response, next) {
  try {
    const { isBestSeller } = request.body;
    if (typeof isBestSeller !== "boolean") {
      return response.status(400).json({ message: "Best seller status must be true or false." });
    }

    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });

    product.isBestSeller = isBestSeller;
    await product.save();
    response.json({ message: isBestSeller ? "Product added to Best Selling Products." : "Product removed from Best Selling Products.", product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function updateProductPopular(request, response, next) {
  try {
    const { isPopular } = request.body;
    if (typeof isPopular !== "boolean") {
      return response.status(400).json({ message: "Popular product status must be true or false." });
    }

    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });

    product.isPopular = isPopular;
    await product.save();
    response.json({ message: isPopular ? "Product added to Popular Products." : "Product removed from Popular Products.", product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function updateProductNewLaunch(request, response, next) {
  try {
    const { isNewLaunch } = request.body;
    if (typeof isNewLaunch !== "boolean") {
      return response.status(400).json({ message: "New launch status must be true or false." });
    }

    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });

    product.isNewLaunch = isNewLaunch;
    await product.save();
    response.json({ message: isNewLaunch ? "Product added to New Launched Products." : "Product removed from New Launched Products.", product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function updateProductUpcoming(request, response, next) {
  try {
    const { isUpcoming } = request.body;
    if (typeof isUpcoming !== "boolean") {
      return response.status(400).json({ message: "Upcoming product status must be true or false." });
    }

    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });

    product.isUpcoming = isUpcoming;
    await product.save();
    response.json({ message: isUpcoming ? "Product added to Upcoming Products." : "Product removed from Upcoming Products.", product });
  } catch (error) {
    if (error.name === "CastError") return response.status(404).json({ message: "Product not found." });
    next(error);
  }
}

export async function createProduct(request, response, next) {
  try {
    const message = validateFields(request.body);
    if (message) {
      if (request.file) await fs.unlink(request.file.path).catch(() => {});
      return response.status(400).json({ message });
    }
    const imageUrl = request.body.imageUrl?.trim();
    if (!request.file && !imageUrl) return response.status(400).json({ message: "Product image URL or uploaded image is required." });
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      if (request.file) await fs.unlink(request.file.path).catch(() => {});
      return response.status(400).json({ message: "Please enter a valid http or https image URL." });
    }

    const product = await Product.create({
      name: request.body.name.trim(),
      brand: request.body.brand.trim(),
      category: request.body.category,
      price: Number(request.body.price),
      originalPrice: Number(request.body.originalPrice),
      rating: Number(request.body.rating || 0),
      stock: Number(request.body.stock),
      description: request.body.description.trim(),
      image: request.file ? `/uploads/${request.file.filename}` : imageUrl,
      createdBy: request.user._id,
    });
    response.status(201).json({ message: `${product.category} product added successfully.`, product });
  } catch (error) {
    if (request.file) await fs.unlink(request.file.path).catch(() => {});
    next(error);
  }
}

export async function updateProduct(request, response, next) {
  try {
    const message = validateFields(request.body);
    if (message) {
      if (request.file) await fs.unlink(request.file.path).catch(() => {});
      return response.status(400).json({ message });
    }

    const imageUrl = request.body.imageUrl?.trim();
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      if (request.file) await fs.unlink(request.file.path).catch(() => {});
      return response.status(400).json({ message: "Please enter a valid http or https image URL." });
    }

    const product = await Product.findById(request.params.id);
    if (!product) {
      if (request.file) await fs.unlink(request.file.path).catch(() => {});
      return response.status(404).json({ message: "Product not found." });
    }

    const previousImage = product.image;
    product.name = request.body.name.trim();
    product.brand = request.body.brand.trim();
    product.category = request.body.category;
    product.price = Number(request.body.price);
    product.originalPrice = Number(request.body.originalPrice);
    product.rating = Number(request.body.rating || 0);
    product.stock = Number(request.body.stock);
    product.description = request.body.description.trim();
    if (request.file) product.image = `/uploads/${request.file.filename}`;
    else if (imageUrl) product.image = imageUrl;
    await product.save();
    if (request.file || imageUrl) await removeImage(previousImage);

    response.json({ message: `${product.category} product updated successfully.`, product });
  } catch (error) {
    if (request.file) await fs.unlink(request.file.path).catch(() => {});
    next(error);
  }
}

export async function deleteProduct(request, response, next) {
  try {
    const product = await Product.findById(request.params.id);
    if (!product) return response.status(404).json({ message: "Product not found." });
    await product.deleteOne();
    await removeImage(product.image);
    response.json({ message: `${product.category} product deleted successfully.` });
  } catch (error) {
    next(error);
  }
}
