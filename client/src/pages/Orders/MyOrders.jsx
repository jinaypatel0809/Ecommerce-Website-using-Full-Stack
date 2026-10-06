import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAssetUrl } from "../../services/authAPI";
import { cancelMyOrder, getMyOrders } from "../../services/orderAPI";

const canCancelOrder = (status) => ["paid", "processing"].includes(status);
const formatStatus = (status) => status.replaceAll("_", " ");

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 401) {
        navigate("/user/signin", { replace: true, state: { message: requestError.message } });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const cancelOrder = async (order) => {
    const confirmed = window.confirm(
      "Cancel this order? Its refund will be processed manually by the seller and may take time.",
    );
    if (!confirmed) return;

    setCancellingId(order._id);
    setError("");
    setMessage("");
    try {
      const data = await cancelMyOrder(order._id);
      setOrders((currentOrders) => currentOrders.map((current) => (
        current._id === order._id ? data.order : current
      )));
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCancellingId("");
    }
  };

  return (
    <section className="mx-auto max-w-400">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">My Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">View your purchases and manage eligible orders.</p>
        </div>
        <button type="button" onClick={loadOrders} disabled={loading} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold disabled:opacity-50 dark:border-neutral-700">
          {loading ? "Refreshing..." : "Refresh orders"}
        </button>
      </div>

      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}

      {loading && !orders.length ? (
        <div className="rounded-2xl bg-white p-14 text-center dark:bg-neutral-900">Loading your orders...</div>
      ) : !orders.length ? (
        <div className="rounded-2xl bg-white p-14 text-center shadow-sm dark:bg-neutral-900">
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-sm text-neutral-500">Orders you place will appear here.</p>
          <Link to="/search" className="mt-6 inline-block rounded-lg bg-[#2874f0] px-6 py-3 font-bold text-white">Continue shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const cancellable = canCancelOrder(order.status);
            const statusStyle = order.status === "delivered" || order.status === "refunded"
              ? "bg-green-100 text-green-800"
              : order.status === "refund_pending" || order.status === "payment_review"
                ? "bg-amber-100 text-amber-800"
                : order.status === "shipped"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800";

            return (
              <article key={order._id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-5 dark:border-neutral-800">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500">Order ID</p>
                    <strong className="break-all text-sm">{order._id}</strong>
                    <p className="mt-1 text-xs text-neutral-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle}`}>{formatStatus(order.status)}</span>
                    {cancellable && (
                      <button
                        type="button"
                        disabled={Boolean(cancellingId)}
                        onClick={() => cancelOrder(order)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingId === order._id ? "Cancelling..." : "Cancel order"}
                      </button>
                    )}
                  </div>
                </header>

                <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={`${order._id}-${item.product}`} className="flex items-center gap-4">
                        <img src={getAssetUrl(item.image)} alt={item.name} className="size-16 rounded-lg bg-neutral-50 object-contain dark:bg-neutral-800" />
                        <div className="min-w-0 flex-1">
                          <strong className="block text-sm">{item.name}</strong>
                          <p className="text-xs text-neutral-500">{item.brand} · Qty {item.quantity}</p>
                        </div>
                        <strong className="shrink-0 text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-800">
                    <h2 className="font-bold">Delivery address</h2>
                    <p className="mt-2 font-semibold">{order.customer.name}</p>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                      {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} - {order.address.postalCode}
                    </p>
                    <p className="mt-4 border-t border-neutral-200 pt-3 text-base font-extrabold dark:border-neutral-700">
                      Total ₹{order.total.toLocaleString("en-IN")}
                    </p>
                    {order.status === "refund_pending" && (
                      <p className="mt-2 text-xs font-semibold text-amber-800">
                        {order.razorpayRefundId
                          ? "Your refund has been initiated. Please allow time for it to appear in your bank account."
                          : "Cancellation recorded. Your refund will be processed manually."}
                      </p>
                    )}
                    {order.status === "refunded" && (
                      <p className="mt-2 text-xs font-semibold text-green-700">Your refund has been processed.</p>
                    )}
                    {!cancellable && !["refund_pending", "refunded", "delivered"].includes(order.status) && (
                      <p className="mt-2 text-xs text-neutral-500">This order can no longer be cancelled.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
