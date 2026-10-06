import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "../../services/authAPI";
import { getProducts } from "../../services/productAPI";

export default function NewLaunchedProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadNewLaunches = () => getProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data.products.filter((product) => product.isNewLaunch));
          setError("");
        }
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message);
      });

    loadNewLaunches();
    const refreshTimer = window.setInterval(loadNewLaunches, 60_000);
    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  if (!products.length) {
    return error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null;
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm dark:from-neutral-900 dark:via-neutral-900 dark:to-indigo-950/30 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white"><span aria-hidden="true">&#10022;</span> JUST ARRIVED</span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">New Launched Products</h2>
          <p className="mt-1 text-sm text-neutral-500">Be the first to discover our latest arrivals.</p>
        </div>
        <Link to="/search?newLaunches=true" className="rounded-full border border-[#2874f0] px-5 py-2.5 text-sm font-bold text-[#2874f0] transition hover:bg-[#2874f0] hover:text-white">View All &rarr;</Link>
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(210px,1fr)] gap-4 overflow-x-auto pb-2 sm:auto-cols-[minmax(230px,1fr)] lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible">
        {products.map((product, index) => {
          const discount = product.originalPrice > 0
            ? Math.max(0, Math.round((1 - product.price / product.originalPrice) * 100))
            : 0;
          return (
            <Link key={product._id} to={`/products/${product._id}`} className="group overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="relative flex aspect-square items-center justify-center bg-white p-4 dark:bg-neutral-900">
                <span className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-xs font-bold text-white ${["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-pink-600"][index % 5]}`}>New Launch</span>
                {discount > 0 && <span className="absolute right-3 bottom-3 z-10 rounded-md bg-green-600 px-2 py-1 text-xs font-extrabold text-white">{discount}% OFF</span>}
                {!product.stock && <span className="absolute right-3 top-12 z-10 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">Out of Stock</span>}
                <img src={getAssetUrl(product.image)} alt={product.name} className={`size-full object-contain transition duration-300 group-hover:scale-105 ${product.stock ? "" : "opacity-60"}`} loading="lazy" />
              </div>
              <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">{product.brand} · {product.category}</p>
                <h3 className="mt-1 truncate font-bold">{product.name}</h3>
                <p className="mt-2 text-sm font-bold text-green-600">{product.rating ? `${product.rating} ★` : "Just launched"}</p>
                <p className={`mt-1 text-xs font-bold ${product.stock ? "text-green-600" : "text-red-600"}`}>{product.stock ? "Free Delivery" : "Out of stock"}</p>
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
