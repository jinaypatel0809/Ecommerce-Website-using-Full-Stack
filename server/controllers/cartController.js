import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const populatedCart = (userId) => Cart.findOne({ user: userId }).populate("items.product");

export async function getCart(request, response, next) {
  try {
    let cart = await populatedCart(request.user._id);
    if (!cart) cart = await Cart.create({ user: request.user._id, items: [] });
    response.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(request, response, next) {
  try {
    const product = await Product.findById(request.body.productId);
    if (!product) return response.status(404).json({ message: "Product not found." });
    if (product.stock < 1) return response.status(400).json({ message: "This product is out of stock." });

    let cart = await Cart.findOne({ user: request.user._id });
    if (!cart) cart = new Cart({ user: request.user._id, items: [] });
    const item = cart.items.find((entry) => entry.product.toString() === product._id.toString());
    if (item) {
      if (item.quantity >= product.stock) return response.status(400).json({ message: "Maximum available stock is already in your cart." });
      item.quantity += 1;
    } else {
      cart.items.push({ product: product._id, quantity: 1 });
    }
    await cart.save();
    cart = await populatedCart(request.user._id);
    response.status(201).json({ message: "Product added to cart.", cart });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(request, response, next) {
  try {
    const quantity = Number(request.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return response.status(400).json({ message: "Quantity must be at least 1." });

    const cart = await Cart.findOne({ user: request.user._id });
    const item = cart?.items.find((entry) => entry.product.toString() === request.params.productId);
    if (!item) return response.status(404).json({ message: "Cart item not found." });
    const product = await Product.findById(request.params.productId);
    if (!product || (quantity > product.stock && quantity > item.quantity)) {
      return response.status(400).json({ message: product?.stock ? "Requested quantity exceeds available stock." : "This product is out of stock." });
    }
    item.quantity = quantity;
    await cart.save();
    response.json({ message: "Cart updated.", cart: await populatedCart(request.user._id) });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(request, response, next) {
  try {
    const cart = await Cart.findOne({ user: request.user._id });
    if (!cart) return response.status(404).json({ message: "Cart not found." });
    cart.items = cart.items.filter((entry) => entry.product.toString() !== request.params.productId);
    await cart.save();
    response.json({ message: "Product removed from cart.", cart: await populatedCart(request.user._id) });
  } catch (error) {
    next(error);
  }
}
