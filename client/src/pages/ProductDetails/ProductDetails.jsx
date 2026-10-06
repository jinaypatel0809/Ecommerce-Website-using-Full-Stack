import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAssetUrl, getSession } from "../../services/authAPI";
import { addToCart } from "../../services/cartAPI";
import { getProduct } from "../../services/productAPI";

export default function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getProduct(id).then((data) => setProduct(data.product)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (getSession()?.user?.role !== "user") return navigate("/user/signin", { state: { from: `/products/${id}` } });
    try {
      setAdding(true);
      setError("");
      const data = await addToCart(id);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-400 rounded-2xl bg-white p-16 text-center dark:bg-neutral-900">Loading product...</div>;
  if (!product) return <div className="mx-auto max-w-400 rounded-2xl bg-white p-16 text-center dark:bg-neutral-900"><h1 className="text-2xl font-bold">Product not found</h1><p className="mt-3 text-red-600">{error}</p><Link to="/search" className="mt-5 inline-block font-bold text-[#2874f0]">Back to products</Link></div>;

  const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <section className="mx-auto max-w-400 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
      <div className="grid lg:grid-cols-2">
        <div className="flex items-center justify-center bg-white p-5 dark:bg-neutral-900 sm:p-10"><div className="flex aspect-square w-full max-w-135 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-neutral-900"><img src={getAssetUrl(product.image)} alt={product.name} className="size-full object-contain object-center" /></div></div>
        <div className="p-7 sm:p-12">
          <Link to={`/search?category=${encodeURIComponent(product.category)}`} className="text-sm font-bold text-[#2874f0]">&larr; Back to {product.category}</Link>
          <p className="mt-8 text-sm font-bold tracking-wider text-neutral-400 uppercase">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3"><span className="rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">New</span><span className="text-sm text-neutral-500">Admin verified product</span></div>
          <div className="mt-7 flex flex-wrap items-baseline gap-3"><strong className="text-3xl">₹{product.price.toLocaleString("en-IN")}</strong>{product.originalPrice > product.price && <><del className="text-neutral-400">₹{product.originalPrice.toLocaleString("en-IN")}</del><span className="font-bold text-green-600">{discount}% off</span></>}</div>
          <p className={`mt-3 text-sm font-bold ${product.stock ? "text-green-600" : "text-red-600"}`}>{product.stock ? `${product.stock} units available` : "Currently out of stock"}</p>
          <div className="my-7 border-y border-neutral-100 py-7 dark:border-neutral-800"><h2 className="font-extrabold">Product description</h2><p className="mt-3 whitespace-pre-line leading-7 text-neutral-600 dark:text-neutral-300">{product.description}</p></div>
          {message && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">{message} <Link to="/cart" className="ml-2 underline">View cart</Link></p>}
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button onClick={handleAddToCart} disabled={!product.stock || adding} className="w-full rounded-xl bg-[#ff9f00] px-7 py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-neutral-300">{adding ? "Adding..." : product.stock ? "Add to Cart" : "Out of Stock"}</button>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-neutral-500"><span>Secure payment</span><span>Easy returns</span><span>Fast delivery</span></div>
        </div>
      </div>
    </section>
  );
}
