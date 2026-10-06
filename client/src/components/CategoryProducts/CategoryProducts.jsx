import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "../../services/authAPI";
import { getProducts } from "../../services/productAPI";
import { matchesProductSearch } from "../../utils/productSearch";

export default function CategoryProducts({ category, priceRanges }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    getProducts(category)
      .then((data) => setProducts(data.products))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [category]);

  const brands = [...new Set(products.map((product) => product.brand))].sort();
  const filteredProducts = products.filter((product) => (
    matchesProductSearch(product, searchTerm)
    &&
    (!priceFilter || priceRanges.find(([value]) => value === priceFilter)?.[2]?.(product.price))
    && (!brandFilter || product.brand === brandFilter)
    && (!ratingFilter
      || (ratingFilter === "1-2" && product.rating >= 1 && product.rating < 2)
      || (ratingFilter === "2-3" && product.rating >= 2 && product.rating < 3)
      || (ratingFilter === "3-4" && product.rating >= 3 && product.rating < 4)
      || (ratingFilter === "4-5" && product.rating >= 4 && product.rating <= 5))
  ));
  const productsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const selectClass = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#2874f0] dark:border-neutral-700 dark:bg-neutral-900";
  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setPriceFilter("");
    setBrandFilter("");
    setRatingFilter("");
    setCurrentPage(1);
  }, [category]);

  return (
    <section className="mx-auto max-w-400">
      <div className="mb-6"><p className="text-xs font-bold tracking-widest text-[#2874f0] uppercase">Store collection</p><h1 className="mt-2 text-3xl font-extrabold">{category}</h1><p className="mt-2 text-sm text-neutral-500">Only products published by the admin are shown here.</p></div>
      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:bg-neutral-900">
        <label className="text-sm font-semibold">Search products<input type="search" value={searchTerm} onChange={updateFilter(setSearchTerm)} placeholder="Name, brand or category" className={selectClass} /></label>
        <label className="text-sm font-semibold">Pricing<select value={priceFilter} onChange={updateFilter(setPriceFilter)} className={selectClass}><option value="">All prices</option>{priceRanges.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-semibold">Brand<select value={brandFilter} onChange={updateFilter(setBrandFilter)} className={selectClass}><option value="">All brands</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
        <label className="text-sm font-semibold">Rating<select value={ratingFilter} onChange={updateFilter(setRatingFilter)} className={selectClass}><option value="">All ratings</option><option value="1-2">1 - 2 ★</option><option value="2-3">2 - 3 ★</option><option value="3-4">3 - 4 ★</option><option value="4-5">4 - 5 ★</option></select></label>
      </div>}
      {loading ? <div className="rounded-2xl bg-white p-16 text-center dark:bg-neutral-900">Loading products...</div> : filteredProducts.length === 0 ? <div className="rounded-2xl bg-white p-16 text-center dark:bg-neutral-900"><h2 className="text-xl font-bold">No products found</h2><p className="mt-2 text-neutral-500">Try another search or change the selected filters.</p></div> : <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visibleProducts.map((product) => <article key={product._id} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-900"><Link to={`/products/${product._id}`}><div className="aspect-square w-full overflow-hidden bg-white dark:bg-neutral-900"><img src={getAssetUrl(product.image)} alt={product.name} className="size-full object-cover object-center" /></div><div className="border-t border-neutral-100 p-4 dark:border-neutral-800"><p className="text-xs text-neutral-500">{product.brand}</p><h2 className="mt-1 truncate font-bold">{product.name}</h2><div className="mt-3 flex flex-wrap items-baseline gap-2"><strong className="text-lg">₹{product.price.toLocaleString("en-IN")}</strong><del className="text-xs text-neutral-400">₹{product.originalPrice.toLocaleString("en-IN")}</del></div><p className="mt-2 text-sm font-bold text-amber-500">{product.rating ? `${product.rating} ★` : "Not rated"}</p><p className={`mt-1 text-xs font-bold ${product.stock ? "text-green-600" : "text-red-600"}`}>{product.stock ? `${product.stock} in stock` : "Out of stock"}</p></div></Link></article>)}</div>
        {totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Product pagination"><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700">Prev</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button type="button" key={page} onClick={() => setCurrentPage(page)} className={`size-9 rounded-lg text-sm font-semibold ${page === currentPage ? "bg-[#2874f0] text-white" : "border border-neutral-200 dark:border-neutral-700"}`}>{page}</button>)}<button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700">Next</button></nav>}
      </>}
    </section>
  );
}
