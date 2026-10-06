import CategoryProducts from "../../components/CategoryProducts/CategoryProducts";

export default function Mobiles() {
  return <CategoryProducts category="Mobiles" priceRanges={[["under-20000", "Under Rs.20,000", (price) => price < 20000], ["20000-50000", "Rs.20,000 - Rs.50,000", (price) => price >= 20000 && price <= 50000], ["over-50000", "Above Rs.50,000", (price) => price > 50000]]} />;
}
