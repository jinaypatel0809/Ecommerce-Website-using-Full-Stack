import CategoryProducts from "../../components/CategoryProducts/CategoryProducts";

export default function Headphones() {
  return <CategoryProducts category="Headphones" priceRanges={[["under-2000", "Under Rs.2,000", (price) => price < 2000], ["2000-4000", "Rs.2,000 - Rs.4,000", (price) => price >= 2000 && price <= 4000], ["4000-6000", "Rs.4,000 - Rs.6,000", (price) => price > 4000 && price <= 6000], ["over-6000", "Above Rs.6,000", (price) => price > 6000]]} />;
}
