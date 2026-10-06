import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "../../services/authAPI";
import { getProducts } from "../../services/productAPI";

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));
};

export default function DealsOfTheDay() {
  const [products, setProducts] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const activeDeals = products.filter((product) => product.isDeal && new Date(product.dealExpiresAt).getTime() > now);
  const nextExpiry = activeDeals.reduce((expiry, product) => Math.min(expiry, new Date(product.dealExpiresAt).getTime()), Infinity);
  const [hours, minutes, seconds] = formatCountdown(nextExpiry - now);

  useEffect(() => {
    let mounted = true;
    const loadDeals = () => getProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data.products);
          setError("");
        }
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message);
      });

    loadDeals();
    const refreshTimer = window.setInterval(loadDeals, 60_000);
    const countdownTimer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(countdownTimer);
    };
  }, []);

  if (!activeDeals.length) {
    return error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null;
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 shadow-sm dark:from-neutral-900 dark:via-neutral-900 dark:to-pink-950/30 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-amber-400" aria-hidden="true">&#9889;</span>
          <div><h2 className="text-xl font-extrabold sm:text-2xl">Deals of the Day</h2><p className="text-sm text-neutral-500">Grab the best deals before time runs out!</p></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-center text-rose-600">
            {[[hours, "Hours"], [minutes, "Minutes"], [seconds, "Seconds"]].map(([value, label]) => <div key={label} className="min-w-12"><strong className="block text-xl font-extrabold tabular-nums sm:text-2xl">{value}</strong><span className="text-[10px] font-semibold uppercase">{label}</span></div>)}
          </div>
          <Link to="/search?deals=true" className="text-sm font-bold text-[#2874f0] hover:underline">View all &rarr;</Link>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(210px,1fr)] gap-4 overflow-x-auto pb-2 sm:auto-cols-[minmax(230px,1fr)] lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible">
        {activeDeals.map((product) => {
          const discount = product.originalPrice > 0
            ? Math.max(0, Math.round((1 - product.price / product.originalPrice) * 100))
            : 0;
          return (
            <Link key={product._id} to={`/products/${product._id}`} className="group overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="relative flex aspect-square items-center justify-center bg-white p-4 dark:bg-neutral-900">
                {discount > 0 && <span className="absolute top-3 left-3 rounded-md bg-green-600 px-2 py-1 text-xs font-extrabold text-white">{discount}% OFF</span>}
                {!product.stock && <span className="absolute right-3 bottom-3 z-10 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">Out of Stock</span>}
                <img src={getAssetUrl(product.image)} alt={product.name} className={`size-full object-contain transition duration-300 group-hover:scale-105 ${product.stock ? "" : "opacity-60"}`} loading="lazy" />
              </div>
              <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">{product.brand} · {product.category}</p>
                <h3 className="mt-1 truncate font-bold">{product.name}</h3>
                <p className="mt-2 text-sm font-bold text-green-600">{product.rating ? `${product.rating} ★` : "New deal"}</p>
                <p className={`mt-1 text-xs font-bold ${product.stock ? "text-green-600" : "text-red-600"}`}>{product.stock ? `${product.stock} in stock` : "Out of stock"}</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-2"><strong className="text-lg">₹{product.price.toLocaleString("en-IN")}</strong>{product.originalPrice > product.price && <del className="text-xs text-neutral-400">₹{product.originalPrice.toLocaleString("en-IN")}</del>}</div>
                <span className="mt-3 block rounded-lg bg-[#2874f0] px-3 py-2 text-center text-sm font-bold text-white">View product</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
