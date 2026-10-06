import CategoryProducts from "../../components/CategoryProducts/CategoryProducts";

export default function Neckband() {
  return <CategoryProducts category="Neckband" priceRanges={[["under-1000", "Under Rs.1,000", (price) => price < 1000], ["1000-3000", "Rs.1,000 - Rs.3,000", (price) => price >= 1000 && price <= 3000], ["3000-5000", "Rs.3,000 - Rs.5,000", (price) => price > 3000 && price <= 5000], ["over-5000", "Above Rs.5,000", (price) => price > 5000]]} />;
}
