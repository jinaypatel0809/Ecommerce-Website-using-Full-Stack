import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAssetUrl, getSession } from "../../services/authAPI";
import { getCart, removeFromCart, updateCartQuantity } from "../../services/cartAPI";
import { createCheckoutOrder, verifyCheckoutPayment } from "../../services/orderAPI";

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your internet connection and try again."));
    document.body.appendChild(script);
  });
};

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState({
    name: getSession()?.user?.name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const loadCart = () => getCart().then((data) => setCart(data.cart)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  useEffect(() => { loadCart(); }, []);

  const updateAddress = (event) => setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));

  const changeQuantity = async (productId, quantity) => {
    try {
      const data = await updateCartQuantity(productId, quantity);
      setCart(data.cart);
    } catch (requestError) { setError(requestError.message); }
  };

  const removeItem = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      setCart(data.cart);
    } catch (requestError) { setError(requestError.message); }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setPlacingOrder(true);
    let checkout;
    try {
      await loadRazorpay();
      checkout = await createCheckoutOrder(address);
    } catch (requestError) {
      setError(requestError.message);
      setPlacingOrder(false);
      if (requestError.status === 401) {
        navigate("/user/signin", { replace: true, state: { message: requestError.message } });
      }
      return;
    }

    let paymentFinished = false;
    const payment = new window.Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: "Flipkart",
      description: "Order payment",
      order_id: checkout.razorpayOrderId,
      prefill: {
        name: checkout.customer.name,
        email: checkout.customer.email,
        contact: checkout.customer.phone,
      },
      notes: { orderId: checkout.orderId },
      theme: { color: "#2874f0" },
      handler: async (paymentResponse) => {
        paymentFinished = true;
        try {
          const result = await verifyCheckoutPayment(checkout.orderId, paymentResponse);
          setMessage(`${result.message} Order ID: ${result.orderId}`);
          try {
            const cartData = await getCart();
            setCart(cartData.cart);
          } catch {
            setError("Payment succeeded, but your cart could not refresh. Reload this page to see its current contents.");
          }
        } catch (verifyError) {
          setError(verifyError.message);
        } finally {
          setPlacingOrder(false);
        }
      },
      modal: {
        ondismiss: () => {
          if (!paymentFinished) setPlacingOrder(false);
        },
      },
    });
    payment.on("payment.failed", (paymentResponse) => {
      paymentFinished = true;
      setError(paymentResponse.error?.description || "Payment failed. No order has been confirmed.");
      setPlacingOrder(false);
    });
    payment.open();
  };

  const items = cart.items.filter((item) => item.product);
  const hasUnavailableItems = items.some(({ product, quantity }) => product.stock < quantity);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const savings = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, item.product.originalPrice - item.product.price) * item.quantity, 0), [items]);

  if (loading) return <div className="mx-auto max-w-400 rounded-2xl bg-white p-16 text-center dark:bg-neutral-900">Loading your cart...</div>;

  return (
    <section className="mx-auto max-w-400">
      <h1 className="mb-6 text-3xl font-extrabold">My Cart <span className="text-base font-normal text-neutral-500">({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span></h1>
      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
      {!items.length ? <div className="rounded-2xl bg-white p-16 text-center shadow-sm dark:bg-neutral-900"><h2 className="text-2xl font-bold">Your cart is empty</h2><p className="mt-2 text-neutral-500">Add a mobile product to see it here.</p><Link to="/search?category=Mobiles" className="mt-6 inline-block rounded-lg bg-[#2874f0] px-6 py-3 font-bold text-white">Shop mobiles</Link></div> : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">{items.map(({ product, quantity }) => {
            const unavailable = product.stock < quantity;
            return <article key={product._id} className="grid grid-cols-[100px_1fr] gap-5 rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900 sm:grid-cols-[140px_1fr]"><Link to={`/products/${product._id}`}><img src={getAssetUrl(product.image)} alt={product.name} className="aspect-square w-full rounded-lg object-contain" /></Link><div><p className="text-xs text-neutral-500">{product.brand}</p><Link to={`/products/${product._id}`} className="mt-1 block text-lg font-bold hover:text-[#2874f0]">{product.name}</Link><p className="mt-3"><strong className="text-xl">₹{product.price.toLocaleString("en-IN")}</strong> <del className="ml-2 text-sm text-neutral-400">₹{product.originalPrice.toLocaleString("en-IN")}</del></p><p className={`mt-2 text-sm font-bold ${unavailable ? "text-red-600" : "text-green-600"}`}>{product.stock === 0 ? "Out of stock" : unavailable ? `Only ${product.stock} available · reduce quantity to continue` : `${product.stock} in stock`}</p><div className="mt-5 flex flex-wrap items-center gap-4"><div className="flex items-center overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700"><button disabled={quantity <= 1} onClick={() => changeQuantity(product._id, quantity - 1)} className="size-9 font-bold disabled:opacity-30">−</button><span className="flex size-9 items-center justify-center border-x border-neutral-300 text-sm font-bold dark:border-neutral-700">{quantity}</span><button disabled={quantity >= product.stock} onClick={() => changeQuantity(product._id, quantity + 1)} className="size-9 font-bold disabled:opacity-30">+</button></div><button onClick={() => removeItem(product._id)} className="text-sm font-bold text-red-600 hover:underline">Remove</button></div></div></article>;
          })}</div>
          <aside className="sticky top-45 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="border-b border-neutral-100 pb-4 text-lg font-extrabold dark:border-neutral-800">Delivery address</h2>
            <form onSubmit={placeOrder}>
              <div className="grid gap-3 py-5">
                <label className="text-xs font-semibold">Full name<input required name="name" maxLength="80" value={address.name} onChange={updateAddress} autoComplete="name" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                <label className="text-xs font-semibold">Phone number<input required name="phone" type="tel" maxLength="20" value={address.phone} onChange={updateAddress} autoComplete="tel" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                <label className="text-xs font-semibold">Address line 1<input required name="line1" maxLength="160" value={address.line1} onChange={updateAddress} autoComplete="address-line1" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                <label className="text-xs font-semibold">Address line 2 (optional)<input name="line2" maxLength="160" value={address.line2} onChange={updateAddress} autoComplete="address-line2" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold">City<input required name="city" maxLength="80" value={address.city} onChange={updateAddress} autoComplete="address-level2" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                  <label className="text-xs font-semibold">State<input required name="state" maxLength="80" value={address.state} onChange={updateAddress} autoComplete="address-level1" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
                </div>
                <label className="text-xs font-semibold">PIN code<input required name="postalCode" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={address.postalCode} onChange={updateAddress} autoComplete="postal-code" className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" /></label>
              </div>
              <div className="space-y-4 border-t border-neutral-100 py-5 text-sm dark:border-neutral-800"><p className="flex justify-between"><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></p><p className="flex justify-between"><span>Delivery</span><strong className="text-green-600">FREE</strong></p><p className="flex justify-between text-green-600"><span>Your savings</span><strong>₹{savings.toLocaleString("en-IN")}</strong></p></div>
              <p className="flex justify-between border-t border-neutral-100 py-5 text-lg dark:border-neutral-800"><strong>Total amount</strong><strong>₹{subtotal.toLocaleString("en-IN")}</strong></p>
              {hasUnavailableItems && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">Remove unavailable products or reduce their quantities before placing your order.</p>}
              <button type="submit" disabled={hasUnavailableItems || placingOrder || !items.length} className="w-full rounded-lg bg-[#fb641b] px-5 py-3.5 font-extrabold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300">{placingOrder ? "Opening secure checkout..." : "Place Order · Pay with Razorpay"}</button>
              <p className="mt-3 text-center text-xs text-neutral-500">Secure payment powered by Razorpay</p>
            </form>
          </aside>
        </div>
      )}
    </section>
  );
}
