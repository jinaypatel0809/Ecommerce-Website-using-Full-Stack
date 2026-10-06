export function matchesProductSearch(product, query) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;

  const searchableText = [
    product.name,
    product.brand,
    product.category,
    product.description,
  ].filter(Boolean).join(" ").toLocaleLowerCase();

  return terms.every((term) => searchableText.includes(term));
}
