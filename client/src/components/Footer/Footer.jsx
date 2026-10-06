import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "ABOUT",
    links: [["Contact Us", "/seller"], ["About Us", "/"], ["Careers", "/seller"], ["Press", "/"]],
  },
  {
    title: "HELP",
    links: [["Payments", "/checkout"], ["Shipping", "/orders"], ["Cancellation & Returns", "/orders"], ["FAQ", "/"]],
  },
  {
    title: "CONSUMER POLICY",
    links: [["Return Policy", "/orders"], ["Terms Of Use", "/"], ["Security", "/"], ["Privacy", "/"]],
  },
  {
    title: "SOCIAL",
    links: [["Facebook", "/"], ["X / Twitter", "/"], ["YouTube", "/"], ["Instagram", "/"]],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-[#172337] text-white">
      <div className="mx-auto grid max-w-400 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-16">
        <div className="lg:border-r lg:border-white/15 lg:pr-10">
          <Link to="/" className="inline-flex flex-col leading-none">
            <span className="text-2xl font-extrabold italic text-white">Flipkart</span>
            <span className="mt-1 text-[11px] italic text-white/55">Explore <b className="text-[#ffd814]">Plus +</b></span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">Your everyday destination for trusted products, great prices and a smoother shopping experience.</p>
        </div>
        {footerColumns.map(({ title, links }) => (
          <div key={title}>
            <h2 className="mb-4 text-xs font-bold text-white/45">{title}</h2>
            <ul className="space-y-3">
              {links.map(([label, path]) => <li key={label}><Link to={path} className="text-sm text-white/85 transition hover:text-[#2874f0]">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-400 flex-col gap-3 px-6 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between lg:px-16">
          <p>© 2026 Flipkart Clone. All rights reserved.</p>
          <div className="flex gap-5"><Link to="/" className="hover:text-white">Become a Seller</Link><Link to="/" className="hover:text-white">Advertise</Link><Link to="/" className="hover:text-white">Gift Cards</Link></div>
        </div>
      </div>
    </footer>
  );
}
