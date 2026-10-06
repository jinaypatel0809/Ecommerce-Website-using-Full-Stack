import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getAssetUrl, getSession } from "../../services/authAPI";
import { getAdminOrders, updateOrderStatus } from "../../services/orderAPI";
import { createProduct, deleteProduct, getProducts, setProductBestSeller, setProductDeal, setProductNewLaunch, setProductPopular, setProductUpcoming, updateProduct } from "../../services/productAPI";

const emptyForm = { name: "", brand: "", price: "", originalPrice: "", rating: "", stock: "", description: "", imageUrl: "", image: null };
const defaultDealExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
const toLocalDateTimeInput = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const DashboardIcon = () => <span className="text-lg">&#9638;</span>;
const MobileIcon = () => <span className="text-lg">&#9633;</span>;

const productLabel = (category) => category === "Mobiles" ? "Mobile" : `${category} Product`;
const productExample = (category) => ({
  Mobiles: "e.g. Galaxy S25",
  Fashion: "e.g. Men's Cotton Jacket",
  Electronics: "e.g. Wireless Headphones",
  Headphones: "e.g. Sony WH-1000XM5",
  Neckband: "e.g. boAt Rockerz Neckband",
  "Men's Shoes": "e.g. Air Running Shoes",
  "Women's Shoes": "e.g. Women's Running Shoes",
  "Men's Brazler": "e.g. Stainless Steel Bracelet",
  "Smart Watches": "e.g. Samsung Galaxy Watch",
  "Men's Watches": "e.g. Men's Analog Watch",
  "Women's Watch": "e.g. Women's Designer Watch",
}[category]);

export default function Dashboard() {
  const [view, setView] = useState("overview");
  const [category, setCategory] = useState("Mobiles");
  const [products, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dealProductId, setDealProductId] = useState("");
  const [dealExpiresAt, setDealExpiresAt] = useState(() => toLocalDateTimeInput(defaultDealExpiry()));
  const [bestSellerProductId, setBestSellerProductId] = useState("");
  const [popularProductId, setPopularProductId] = useState("");
  const [newLaunchProductId, setNewLaunchProductId] = useState("");
  const [upcomingProductId, setUpcomingProductId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const admin = getSession()?.user;

  const loadProducts = async () => {
    try {
      const data = await getProducts(category);
      setProducts(data.products);
    } catch (loadError) {
      if ([401, 403].includes(loadError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(loadError.message);
    }
  };

  useEffect(() => { loadProducts(); }, [category]);

  const loadDealProducts = async () => {
    try {
      const data = await getProducts();
      setDealProducts(data.products);
    } catch (loadError) {
      if ([401, 403].includes(loadError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(loadError.message);
    }
  };

  useEffect(() => {
    if (view === "deals" || view === "bestSellers" || view === "popular" || view === "newLaunches" || view === "upcoming") loadDealProducts();
    if (view === "orders") loadOrders();
  }, [view]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data.orders);
    } catch (loadError) {
      if ([401, 403].includes(loadError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(loadError.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const advanceOrder = async (order, status) => {
    if (status === "refunded" && !window.confirm("Only continue after you have completed the refund manually in Razorpay. Mark this order as refunded?")) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await updateOrderStatus(order._id, status);
      setMessage(data.message);
      await loadOrders();
    } catch (updateError) {
      if ([401, 403].includes(updateError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(updateError.message);
    } finally {
      setLoading(false);
    }
  };

  const selectView = (nextView) => {
    setView(nextView);
    setMessage("");
    setError("");
    if (nextView === "add") resetForm();
  };

  const chooseDealProduct = (productId) => {
    setDealProductId(productId);
    const product = dealProducts.find((item) => item._id === productId);
    setDealExpiresAt(product?.dealExpiresAt
      ? toLocalDateTimeInput(new Date(product.dealExpiresAt))
      : toLocalDateTimeInput(defaultDealExpiry()));
  };

  const saveDeal = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductDeal(dealProductId, true, new Date(dealExpiresAt).toISOString());
      setMessage(data.message);
      setDealProductId("");
      setDealExpiresAt(toLocalDateTimeInput(defaultDealExpiry()));
      await loadDealProducts();
    } catch (saveError) {
      if ([401, 403].includes(saveError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeDeal = async (product) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductDeal(product._id, false);
      setMessage(data.message);
      await loadDealProducts();
    } catch (removeError) {
      if ([401, 403].includes(removeError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(removeError.message);
    } finally {
      setLoading(false);
    }
  };

  const saveBestSeller = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductBestSeller(bestSellerProductId, true);
      setMessage(data.message);
      setBestSellerProductId("");
      await loadDealProducts();
    } catch (saveError) {
      if ([401, 403].includes(saveError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeBestSeller = async (product) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductBestSeller(product._id, false);
      setMessage(data.message);
      await loadDealProducts();
    } catch (removeError) {
      if ([401, 403].includes(removeError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(removeError.message);
    } finally {
      setLoading(false);
    }
  };

  const savePopular = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductPopular(popularProductId, true);
      setMessage(data.message);
      setPopularProductId("");
      await loadDealProducts();
    } catch (saveError) {
      if ([401, 403].includes(saveError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const removePopular = async (product) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductPopular(product._id, false);
      setMessage(data.message);
      await loadDealProducts();
    } catch (removeError) {
      if ([401, 403].includes(removeError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(removeError.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNewLaunch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductNewLaunch(newLaunchProductId, true);
      setMessage(data.message);
      setNewLaunchProductId("");
      await loadDealProducts();
    } catch (saveError) {
      if ([401, 403].includes(saveError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeNewLaunch = async (product) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductNewLaunch(product._id, false);
      setMessage(data.message);
      await loadDealProducts();
    } catch (removeError) {
      if ([401, 403].includes(removeError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(removeError.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUpcoming = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductUpcoming(upcomingProductId, true);
      setMessage(data.message);
      setUpcomingProductId("");
      await loadDealProducts();
    } catch (saveError) {
      if ([401, 403].includes(saveError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeUpcoming = async (product) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await setProductUpcoming(product._id, false);
      setMessage(data.message);
      await loadDealProducts();
    } catch (removeError) {
      if ([401, 403].includes(removeError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(removeError.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setView("add");
    setMessage("");
    setError("");
    resetForm();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPreview("");
  };

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateImage = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const updateImageUrl = (event) => {
    const imageUrl = event.target.value;
    setForm((current) => ({ ...current, imageUrl, image: null }));
    setPreview(imageUrl.trim());
  };

  const editProduct = (product) => {
    setCategory(product.category);
    setEditingId(product._id);
    setForm({ name: product.name, brand: product.brand, price: product.price, originalPrice: product.originalPrice, rating: product.rating || "", stock: product.stock, description: product.description, imageUrl: product.image.startsWith("http") ? product.image : "", image: null });
    setPreview(getAssetUrl(product.image));
    setView("add");
    setMessage("");
    setError("");
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "image" || value) payload.append(key, value);
      });
      payload.append("category", category);
      const data = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
      setMessage(data.message);
      resetForm();
      await loadProducts();
      setView("add");
    } catch (submitError) {
      if ([401, 403].includes(submitError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This action cannot be undone.`)) return;
    try {
      setError("");
      const data = await deleteProduct(product._id);
      setMessage(data.message);
      await loadProducts();
    } catch (deleteError) {
      if ([401, 403].includes(deleteError.status)) {
        clearSession();
        navigate("/admin/signin", { replace: true });
        return;
      }
      setError(deleteError.message);
    }
  };

  const logout = () => {
    clearSession();
    navigate("/admin/signin", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-20 flex-col bg-[#111827] text-white sm:w-68">
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-4 sm:justify-start sm:px-6">
          <span className="text-xl font-black text-blue-400">F</span><span className="hidden text-xl font-extrabold sm:inline">lipkart Admin</span>
        </div>
        <nav className="admin-sidebar-nav min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:p-4">
          {[["overview", <DashboardIcon />, "Dashboard", null], ["mobiles", <MobileIcon />, "Add Mobile", "Mobiles"], ["fashion", <MobileIcon />, "Add Fashion", "Fashion"], ["headphones", <MobileIcon />, "Add Headphones", "Headphones"], ["neckband", <MobileIcon />, "Add Neckband", "Neckband"], ["mens-shoes", <MobileIcon />, "Add Men's Shoes", "Men's Shoes"], ["womens-shoes", <MobileIcon />, "Add Women's Shoes", "Women's Shoes"], ["mens-brazler", <MobileIcon />, "Add Men's Brazler", "Men's Brazler"], ["smart-watches", <MobileIcon />, "Add Smart Watches", "Smart Watches"], ["mens-watches", <MobileIcon />, "Add Men's Watches", "Men's Watches"], ["womens-watch", <MobileIcon />, "Add Women's Watch", "Women's Watch"], ["deals", <MobileIcon />, "Deals of the Day", null], ["bestSellers", <MobileIcon />, "Best Selling Products", null], ["popular", <MobileIcon />, "Popular Products", null], ["newLaunches", <MobileIcon />, "New Launched Products", null], ["upcoming", <MobileIcon />, "Upcoming Products", null], ["orders", <MobileIcon />, "Orders", null]].map(([key, icon, label, itemCategory]) => (
            <button key={key} onClick={() => key === "deals" || key === "bestSellers" || key === "popular" || key === "newLaunches" || key === "upcoming" || key === "orders" ? selectView(key) : itemCategory ? selectCategory(itemCategory) : selectView("overview")} className={`flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-semibold transition sm:justify-start ${(key === "overview" ? view === "overview" : key === "deals" || key === "bestSellers" || key === "popular" || key === "newLaunches" || key === "upcoming" || key === "orders" ? view === key : view === "add" && category === itemCategory) ? "bg-[#2874f0] text-white" : "text-neutral-400 hover:bg-white/10 hover:text-white"}`}>
              {icon}<span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="m-3 cursor-pointer rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 sm:m-4">Logout</button>
      </aside>

      <main className="ml-20 min-w-0 flex-1 sm:ml-68">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200 bg-white/90 px-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 sm:px-8">
          <div><p className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Admin workspace</p><h1 className="text-xl font-extrabold">{view === "add" ? `${editingId ? "Edit" : "Add"} ${productLabel(category)}` : view === "deals" ? "Deals of the Day" : view === "bestSellers" ? "Best Selling Products" : view === "popular" ? "Popular Products" : view === "newLaunches" ? "New Launched Products" : view === "upcoming" ? "Upcoming Products" : view === "orders" ? "Orders" : "Dashboard"}</h1></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><strong className="block text-sm">{admin?.name}</strong><small className="text-neutral-500">Administrator</small></div><span className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-[#2874f0]">{admin?.image ? <img src={getAssetUrl(admin.image)} alt={admin.name} className="size-full object-cover" /> : admin?.name?.[0]}</span></div>
        </header>

        <div className="p-5 sm:p-8">
          {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</p>}

          {view === "orders" && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-lg font-extrabold">Customer orders</h2><p className="text-sm text-neutral-500">Paid orders, newest first. Payment-pending checkouts are not listed.</p></div>
                <button type="button" onClick={loadOrders} disabled={ordersLoading} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold disabled:opacity-50 dark:border-neutral-700">{ordersLoading ? "Refreshing..." : "Refresh orders"}</button>
              </div>
              {ordersLoading && !orders.length ? <div className="rounded-2xl bg-white p-14 text-center dark:bg-neutral-900">Loading orders...</div> : orders.length === 0 ? <div className="rounded-2xl bg-white p-14 text-center dark:bg-neutral-900"><p className="text-lg font-bold">No paid orders yet</p><p className="mt-2 text-sm text-neutral-500">Successfully paid orders will appear here.</p></div> : orders.map((order) => {
                const nextStatus = { placed: "processing", paid: "processing", processing: "shipped", shipped: "delivered", refund_pending: "refunded" }[order.status];
                const statusStyle = ["refund_pending", "payment_review"].includes(order.status) ? "bg-amber-100 text-amber-800" : ["delivered", "refunded"].includes(order.status) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
                return (
                  <article key={order._id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5 dark:border-neutral-800">
                      <div><p className="text-xs font-semibold text-neutral-500">Order ID</p><strong className="break-all text-sm">{order._id}</strong><p className="mt-1 text-xs text-neutral-500">Placed {new Date(order.createdAt).toLocaleString()}</p></div>
                      <div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle}`}>{order.status.replaceAll("_", " ")}</span>{nextStatus && <button type="button" disabled={loading} onClick={() => advanceOrder(order, nextStatus)} className="rounded-lg bg-[#2874f0] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{nextStatus === "refunded" ? "Mark refund complete" : `Mark ${nextStatus}`}</button>}</div>
                    </div>
                    <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                      <div className="space-y-4">{order.items.map((item) => <div key={`${order._id}-${item.product}`} className="flex items-center gap-4"><img src={getAssetUrl(item.image)} alt="" className="size-16 rounded-lg bg-neutral-50 object-contain dark:bg-neutral-800" /><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.name}</strong><p className="text-xs text-neutral-500">{item.brand} · {item.category} · Qty {item.quantity}</p></div><strong className="shrink-0 text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></div>)}</div>
                      <div className="rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-800">
                        <h3 className="font-bold">Deliver to</h3>
                        <p className="mt-2 font-semibold">{order.customer.name}</p>
                        <p className="text-neutral-600 dark:text-neutral-300">{order.customer.phone} · {order.customer.email}</p>
                        <p className="mt-2 text-neutral-600 dark:text-neutral-300">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} - {order.address.postalCode}</p>
                        <p className="mt-4 border-t border-neutral-200 pt-3 text-base font-extrabold dark:border-neutral-700">Total ₹{order.total.toLocaleString("en-IN")}</p>
                        <p className="mt-1 break-all text-xs text-neutral-500">Payment ID: {order.razorpayPaymentId || "Review required"}</p>
                        {order.razorpayRefundId && <p className="mt-1 break-all text-xs text-neutral-500">Refund ID: {order.razorpayRefundId}</p>}
                        {order.status === "refund_pending" && <p className="mt-2 text-xs font-semibold text-amber-800">{order.razorpayRefundId ? "Verify the initiated refund in Razorpay before marking it complete." : "Cancel request recorded. Complete the refund manually in Razorpay before marking it complete."}</p>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {view === "deals" && (
            <div className="space-y-7">
              <form onSubmit={saveDeal} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
                <h2 className="text-xl font-extrabold">Add a product to Deals of the Day</h2>
                <p className="mt-1 text-sm text-neutral-500">Choose an existing product and set when its deal should end.</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <Field label="Product"><select required value={dealProductId} onChange={(event) => chooseDealProduct(event.target.value)} className="input"><option value="">Select a product</option>{dealProducts.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.category}</option>)}</select></Field>
                  <Field label="Deal expires at"><input required type="datetime-local" min={toLocalDateTimeInput(new Date())} value={dealExpiresAt} onChange={(event) => setDealExpiresAt(event.target.value)} className="input" /></Field>
                </div>
                <button disabled={loading || !dealProducts.length} className="mt-6 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : "Add to Deals of the Day"}</button>
                {!dealProducts.length && <p className="mt-3 text-sm text-neutral-500">Add a product first, then select it here.</p>}
              </form>

              <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><h2 className="text-lg font-extrabold">Current deals</h2><p className="text-sm text-neutral-500">Expired deals stop showing on the home page automatically.</p></div>
                {dealProducts.filter((product) => product.isDeal).length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No deals added yet</p><p className="mt-2 text-sm text-neutral-500">Choose a product above to publish the first deal.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Expires</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{dealProducts.filter((product) => product.isDeal).map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.category}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4 text-sm text-neutral-500">{product.dealExpiresAt ? new Date(product.dealExpiresAt).toLocaleString() : "Not set"}</td><td className="p-4 text-right"><button type="button" disabled={loading} onClick={() => removeDeal(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60">Remove deal</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            </div>
          )}

          {view === "bestSellers" && (
            <div className="space-y-7">
              <form onSubmit={saveBestSeller} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
                <h2 className="text-xl font-extrabold">Add a product to Best Selling Products</h2>
                <p className="mt-1 text-sm text-neutral-500">Choose an existing product to feature on the home page. No timer or expiry is required.</p>
                <div className="mt-6">
                  <Field label="Product"><select required value={bestSellerProductId} onChange={(event) => setBestSellerProductId(event.target.value)} className="input"><option value="">Select a product</option>{dealProducts.filter((product) => !product.isBestSeller).map((product) => <option key={product._id} value={product._id}>{product.name} · {product.category}</option>)}</select></Field>
                </div>
                <button disabled={loading || !dealProducts.some((product) => !product.isBestSeller)} className="mt-6 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : "Add to Best Selling Products"}</button>
                {!dealProducts.some((product) => !product.isBestSeller) && <p className="mt-3 text-sm text-neutral-500">All available products are already listed as best sellers.</p>}
              </form>

              <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><h2 className="text-lg font-extrabold">Current best sellers</h2><p className="text-sm text-neutral-500">These products are shown in the Best Selling Products section on the home page.</p></div>
                {dealProducts.filter((product) => product.isBestSeller).length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No best sellers added yet</p><p className="mt-2 text-sm text-neutral-500">Choose a product above to publish the first best seller.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{dealProducts.filter((product) => product.isBestSeller).map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4 text-sm text-neutral-500">{product.category}</td><td className="p-4 text-right"><button type="button" disabled={loading} onClick={() => removeBestSeller(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60">Remove</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            </div>
          )}

          {view === "popular" && (
            <div className="space-y-7">
              <form onSubmit={savePopular} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
                <h2 className="text-xl font-extrabold">Add a product to Popular Products</h2>
                <p className="mt-1 text-sm text-neutral-500">Choose an existing product to feature on the home page. No timer or expiry is required.</p>
                <div className="mt-6">
                  <Field label="Product"><select required value={popularProductId} onChange={(event) => setPopularProductId(event.target.value)} className="input"><option value="">Select a product</option>{dealProducts.filter((product) => !product.isPopular).map((product) => <option key={product._id} value={product._id}>{product.name} · {product.category}</option>)}</select></Field>
                </div>
                <button disabled={loading || !dealProducts.some((product) => !product.isPopular)} className="mt-6 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : "Add to Popular Products"}</button>
                {!dealProducts.some((product) => !product.isPopular) && <p className="mt-3 text-sm text-neutral-500">All available products are already listed as popular.</p>}
              </form>

              <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><h2 className="text-lg font-extrabold">Current popular products</h2><p className="text-sm text-neutral-500">These products are shown in the Popular Products section on the home page.</p></div>
                {dealProducts.filter((product) => product.isPopular).length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No popular products added yet</p><p className="mt-2 text-sm text-neutral-500">Choose a product above to publish the first popular product.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{dealProducts.filter((product) => product.isPopular).map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4 text-sm text-neutral-500">{product.category}</td><td className="p-4 text-right"><button type="button" disabled={loading} onClick={() => removePopular(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60">Remove</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            </div>
          )}

          {view === "newLaunches" && (
            <div className="space-y-7">
              <form onSubmit={saveNewLaunch} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
                <h2 className="text-xl font-extrabold">Add a product to New Launched Products</h2>
                <p className="mt-1 text-sm text-neutral-500">Choose an existing product to feature on the home page. No timer or expiry is required.</p>
                <div className="mt-6">
                  <Field label="Product"><select required value={newLaunchProductId} onChange={(event) => setNewLaunchProductId(event.target.value)} className="input"><option value="">Select a product</option>{dealProducts.filter((product) => !product.isNewLaunch).map((product) => <option key={product._id} value={product._id}>{product.name} · {product.category}</option>)}</select></Field>
                </div>
                <button disabled={loading || !dealProducts.some((product) => !product.isNewLaunch)} className="mt-6 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : "Add to New Launched Products"}</button>
                {!dealProducts.some((product) => !product.isNewLaunch) && <p className="mt-3 text-sm text-neutral-500">All available products are already listed as new launches.</p>}
              </form>

              <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><h2 className="text-lg font-extrabold">Current new launches</h2><p className="text-sm text-neutral-500">These products are shown in the New Launched Products section on the home page.</p></div>
                {dealProducts.filter((product) => product.isNewLaunch).length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No new launches added yet</p><p className="mt-2 text-sm text-neutral-500">Choose a product above to publish the first new launch.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{dealProducts.filter((product) => product.isNewLaunch).map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4 text-sm text-neutral-500">{product.category}</td><td className="p-4 text-right"><button type="button" disabled={loading} onClick={() => removeNewLaunch(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60">Remove</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            </div>
          )}

          {view === "upcoming" && (
            <div className="space-y-7">
              <form onSubmit={saveUpcoming} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
                <h2 className="text-xl font-extrabold">Add a product to Upcoming Products</h2>
                <p className="mt-1 text-sm text-neutral-500">Choose an existing product to feature in the upcoming products section. No timer or expiry is required.</p>
                <div className="mt-6">
                  <Field label="Product"><select required value={upcomingProductId} onChange={(event) => setUpcomingProductId(event.target.value)} className="input"><option value="">Select a product</option>{dealProducts.filter((product) => !product.isUpcoming).map((product) => <option key={product._id} value={product._id}>{product.name} · {product.category}</option>)}</select></Field>
                </div>
                <button disabled={loading || !dealProducts.some((product) => !product.isUpcoming)} className="mt-6 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : "Add to Upcoming Products"}</button>
                {!dealProducts.some((product) => !product.isUpcoming) && <p className="mt-3 text-sm text-neutral-500">All available products are already listed as upcoming.</p>}
              </form>

              <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><h2 className="text-lg font-extrabold">Current upcoming products</h2><p className="text-sm text-neutral-500">These products are shown in the Upcoming Products section on the home page.</p></div>
                {dealProducts.filter((product) => product.isUpcoming).length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No upcoming products added yet</p><p className="mt-2 text-sm text-neutral-500">Choose a product above to publish the first upcoming product.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{dealProducts.filter((product) => product.isUpcoming).map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4 text-sm text-neutral-500">{product.category}</td><td className="p-4 text-right"><button type="button" disabled={loading} onClick={() => removeUpcoming(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60">Remove</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            </div>
          )}

          {view === "overview" && (
            <div>
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[["Total Products", products.length], ["In Stock", products.reduce((sum, item) => sum + item.stock, 0)], ["Low Stock", products.filter((item) => item.stock > 0 && item.stock < 5).length], ["Out of Stock", products.filter((item) => item.stock === 0).length]].map(([label, value]) => <article key={label} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900"><p className="text-sm text-neutral-500">{label}</p><strong className="mt-3 block text-3xl">{value}</strong></article>)}
              </section>
              <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900"><h2 className="text-lg font-bold">Quick actions</h2><p className="mt-2 text-sm text-neutral-500">Create products and publish them directly to the relevant storefront category.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => selectCategory("Mobiles")} className="rounded-lg bg-[#2874f0] px-5 py-3 text-sm font-bold text-white">+ Add mobile</button><button onClick={() => selectCategory("Fashion")} className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">+ Add fashion</button><button onClick={() => selectCategory("Headphones")} className="rounded-lg bg-[#ff9f00] px-5 py-3 text-sm font-bold text-white">+ Add headphones</button><button onClick={() => selectCategory("Neckband")} className="rounded-lg bg-[#7c3aed] px-5 py-3 text-sm font-bold text-white">+ Add neckband</button><button onClick={() => selectCategory("Men's Shoes")} className="rounded-lg bg-[#16a34a] px-5 py-3 text-sm font-bold text-white">+ Add men's shoes</button><button onClick={() => selectCategory("Women's Shoes")} className="rounded-lg bg-[#db2777] px-5 py-3 text-sm font-bold text-white">+ Add women's shoes</button><button onClick={() => selectCategory("Men's Brazler")} className="rounded-lg bg-[#7c3aed] px-5 py-3 text-sm font-bold text-white">+ Add men's brazler</button><button onClick={() => selectCategory("Smart Watches")} className="rounded-lg bg-[#0891b2] px-5 py-3 text-sm font-bold text-white">+ Add smart watches</button><button onClick={() => selectCategory("Men's Watches")} className="rounded-lg bg-[#475569] px-5 py-3 text-sm font-bold text-white">+ Add men's watches</button><button onClick={() => selectCategory("Women's Watch")} className="rounded-lg bg-[#be185d] px-5 py-3 text-sm font-bold text-white">+ Add women's watch</button></div></section>
            </div>
          )}

          {view === "add" && (
            <div className="space-y-7">
            <form onSubmit={submitProduct} className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
              <div className="mb-7 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">{editingId ? `Update ${category.toLowerCase()} details` : `Create a ${category.toLowerCase()} product`}</h2><p className="mt-1 text-sm text-neutral-500">This product will appear in the {category} category.</p></div>{editingId && <button type="button" onClick={resetForm} className="text-sm font-bold text-neutral-500">Cancel edit</button>}</div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Product name"><input required name="name" value={form.name} onChange={updateField} placeholder={productExample(category)} className="input" /></Field>
                <Field label="Brand"><input required name="brand" value={form.brand} onChange={updateField} placeholder="e.g. Samsung" className="input" /></Field>
                <Field label="Selling price"><input required min="0" name="price" value={form.price} onChange={updateField} type="number" placeholder="24999" className="input" /></Field>
                <Field label="Original price"><input required min="0" name="originalPrice" value={form.originalPrice} onChange={updateField} type="number" placeholder="31999" className="input" /></Field>
                <Field label="Rating (0 to 5)"><input required min="0" max="5" step="0.1" name="rating" value={form.rating} onChange={updateField} type="number" placeholder="4.5" className="input" /></Field>
                <Field label="Stock quantity"><input required min="0" name="stock" value={form.stock} onChange={updateField} type="number" placeholder="20" className="input" /></Field>
                <Field label="Product image URL" wide><input name="imageUrl" value={form.imageUrl} onChange={updateImageUrl} type="url" placeholder="Chromeમાંથી Copy image address કરીને અહીં paste કરો" className="input" /><small className="mt-2 block font-normal text-neutral-500">Image પર right-click → Copy image address → અહીં paste કરો. URL http અથવા httpsથી શરૂ થવો જોઈએ.</small></Field>
                <Field label={`Or upload product image${editingId ? " (optional)" : ""}`} wide><input name="image" onChange={updateImage} accept="image/jpeg,image/png,image/webp" type="file" className="input file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-[#2874f0]" /></Field>
                <Field label="Description" wide><textarea required name="description" value={form.description} onChange={updateField} rows="5" placeholder="Features, specifications and product details..." className="input resize-none" /></Field>
                {preview && <div className="md:col-span-2"><p className="mb-2 text-sm font-bold">Image preview</p><img src={preview} alt="Product preview" className="size-36 rounded-xl border border-neutral-200 object-contain" /><small className="mt-2 block text-neutral-500">જો preview ન દેખાય તો website external image loading block કરતી હોઈ શકે છે.</small></div>}
              </div>
              <button disabled={loading} className="mt-7 rounded-lg bg-[#2874f0] px-7 py-3 font-bold text-white disabled:opacity-60">{loading ? "Saving..." : editingId ? "Update product" : `Add ${productLabel(category).toLowerCase()}`}</button>
            </form>
            <ProductTable category={category} products={products} editProduct={editProduct} removeProduct={removeProduct} />
            </div>
          )}

          {view === "products" && (
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6"><div><h2 className="text-lg font-extrabold">Mobile products</h2><p className="text-sm text-neutral-500">{products.length} database product{products.length !== 1 && "s"}</p></div><button onClick={() => selectView("add")} className="rounded-lg bg-[#2874f0] px-4 py-2.5 text-sm font-bold text-white">+ Add Mobile</button></div>
              {products.length === 0 ? <div className="p-14 text-center"><p className="text-lg font-bold">No mobiles added yet</p><p className="mt-2 text-sm text-neutral-500">Add your first mobile to show it in the storefront.</p></div> : (
                <div className="overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Added</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800"><td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-contain" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td><td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{product.stock}</span></td><td className="p-4 text-sm text-neutral-500">{new Date(product.createdAt).toLocaleDateString()}</td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => editProduct(product)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#2874f0]">Edit</button><button onClick={() => removeProduct(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Delete</button></div></td></tr>)}</tbody></table></div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, wide = false, children }) {
  return <label className={`block text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}>{label}{children}</label>;
}

function ProductTable({ category, products, editProduct, removeProduct }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
      <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 sm:p-6">
        <h2 className="text-lg font-extrabold">Added {category.toLowerCase()} products</h2>
        <p className="text-sm text-neutral-500">{products.length} database product{products.length !== 1 && "s"} · Edit or delete from this page</p>
      </div>
      {products.length === 0 ? (
        <div className="p-14 text-center"><p className="text-lg font-bold">No {category.toLowerCase()} products added yet</p><p className="mt-2 text-sm text-neutral-500">Use the form above to add your first product.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Added</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product._id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="p-4"><div className="flex items-center gap-3"><img src={getAssetUrl(product.image)} alt="" className="size-14 rounded-lg object-cover" /><div><strong className="block text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.brand}</span></div></div></td>
                <td className="p-4 text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</td>
                <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{product.stock}</span></td>
                <td className="p-4 text-sm text-neutral-500">{new Date(product.createdAt).toLocaleDateString()}</td>
                <td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => { editProduct(product); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#2874f0]">Edit</button><button onClick={() => removeProduct(product)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Delete</button></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
