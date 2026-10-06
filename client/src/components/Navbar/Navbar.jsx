import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CategoryIcon from "../CategoryIcon/CategoryIcon";
import { clearSession, getAssetUrl, getSession } from "../../services/authAPI";
import { getCart } from "../../services/cartAPI";

const categories = [
  { label: "Mobile", category: "Mobiles", path: "/mobiles" },
  { label: "Headphones", category: "Headphones", path: "/headphones" },
  { label: "Neckband", category: "Neckband", path: "/neckband" },
  { label: "Men's Shoes", category: "Men's Shoes" },
  { label: "Women's Shoes", category: "Women's Shoes" },
  { label: "Men's Brazler", category: "Men's Brazler" },
  { label: "Smart Watches", category: "Smart Watches" },
  { label: "Men's Watches", category: "Men's Watches" },
  { label: "Women's Watch", category: "Women's Watch" },
];

const Icon = ({ children, className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const SearchIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
const UserIcon = () => <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Icon>;
const AdminIcon = () => <Icon><path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-3Z" /><circle cx="12" cy="10" r="2.5" /><path d="M8.5 16c.8-1.5 2-2.2 3.5-2.2s2.7.7 3.5 2.2" /></Icon>;
const CartIcon = () => <Icon><path d="M3 4h2l2.2 10h10.7l2-7H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></Icon>;
const StoreIcon = () => <Icon><path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-6h5v6" /><path d="M3 10c0 2 3 2.5 4.5.5C9 13 12 13 13.5 10.5 15 13 18 12.5 18 10" /></Icon>;
const SunIcon = () => <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
const MoonIcon = () => <Icon><path d="M20.5 14.2A8 8 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></Icon>;

function AccountMenu({ type, open, onToggle, onClose }) {
  const admin = type === "admin";
  const base = admin ? "/admin" : "/user";
  const label = admin ? "Admin account" : "User account";

  return (
    <div className="relative">
      <button onClick={onToggle} className="flex size-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#2874f0] hover:text-white dark:hover:bg-blue-600" aria-label={label} aria-expanded={open}>
        {admin ? <AdminIcon /> : <UserIcon />}
      </button>
      {open && (
        <div className="absolute top-12 right-0 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <p className="border-b border-neutral-100 px-4 py-2 text-xs font-bold tracking-wider text-neutral-400 uppercase dark:border-neutral-800">{admin ? "Admin" : "My account"}</p>
          <Link onClick={onClose} to={`${base}/signin`} className="block px-4 py-3 font-medium hover:bg-blue-50 hover:text-[#2874f0] dark:hover:bg-neutral-800">Sign in</Link>
          <Link onClick={onClose} to={`${base}/signup`} className="block px-4 py-3 font-medium hover:bg-blue-50 hover:text-[#2874f0] dark:hover:bg-neutral-800">Create account</Link>
        </div>
      )}
    </div>
  );
}

function LoggedInUserMenu({ user, open, onToggle, onClose, onLogout }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative">
      <button onClick={onToggle} className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-blue-50 ring-2 ring-transparent transition hover:ring-[#2874f0] dark:bg-neutral-800" aria-label={`${user.name} account menu`} aria-expanded={open}>
        {user.image && !imageFailed
          ? <img src={getAssetUrl(user.image)} onError={() => setImageFailed(true)} alt={user.name} className="size-full object-cover" />
          : <span className="p-2 text-[#2874f0] [&_svg]:size-full"><UserIcon /></span>}
      </button>
      {open && (
        <div className="absolute top-12 right-0 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[#2874f0] dark:bg-neutral-800">
              {user.image && !imageFailed ? <img src={getAssetUrl(user.image)} onError={() => setImageFailed(true)} alt="" className="size-full object-cover" /> : <span className="size-7"><UserIcon /></span>}
            </span>
            <span className="min-w-0"><strong className="block truncate text-sm">{user.name}</strong><small className="block truncate text-neutral-500">{user.email}</small></span>
          </div>
          <Link onClick={onClose} to="/profile" className="block px-4 py-3 text-sm font-medium hover:bg-blue-50 hover:text-[#2874f0] dark:hover:bg-neutral-800">My profile</Link>
          <Link onClick={onClose} to="/orders" className="block px-4 py-3 text-sm font-medium hover:bg-blue-50 hover:text-[#2874f0] dark:hover:bg-neutral-800">My orders</Link>
          <button onClick={onLogout} className="w-full cursor-pointer border-t border-neutral-100 px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-950/30">Logout</button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [session, setSession] = useState(() => getSession());
  const [cartCount, setCartCount] = useState(0);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const close = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setAccountMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (session?.user?.role !== "user") return setCartCount(0);
    const countItems = (cart) => setCartCount(cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    getCart().then((data) => countItems(data.cart)).catch(() => setCartCount(0));
    const handleCartUpdate = (event) => countItems(event.detail);
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [session]);

  useEffect(() => {
    const refreshSession = (event) => setSession(event.detail);
    window.addEventListener("auth-session-updated", refreshSession);
    return () => window.removeEventListener("auth-session-updated", refreshSession);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const logoutUser = () => {
    clearSession();
    setSession(null);
    setCartCount(0);
    setAccountMenu(null);
    setMobileOpen(false);
    navigate("/user/signin", { replace: true });
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white text-[#212121] shadow-sm transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto flex min-h-17 max-w-400 flex-wrap items-center gap-3 px-4 py-2.5 lg:flex-nowrap lg:gap-7 lg:px-12">
        <Link className="order-1 flex shrink-0 flex-col leading-none" to="/">
          <span className="text-[22px] font-extrabold tracking-tight text-[#2874f0] italic">Flipkart</span>
          <span className="mt-1 text-[11px] text-neutral-500 italic">Explore <b className="text-[#f7c600]">Plus +</b></span>
        </Link>

        <form className="order-3 flex h-11 basis-full overflow-hidden rounded-lg bg-[#f0f5ff] dark:bg-neutral-800 md:order-2 md:min-w-60 md:flex-1 md:basis-auto lg:max-w-180" onSubmit={handleSearch}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search for Products, Brands and More" className="min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:text-neutral-500" />
          <button className="flex w-12 cursor-pointer items-center justify-center text-[#2874f0] [&_svg]:size-6" aria-label="Search"><SearchIcon /></button>
        </form>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="order-2 ml-auto p-2 md:hidden" aria-label="Toggle menu"><span className="block text-2xl">&#9776;</span></button>

        <nav className={`${mobileOpen ? "flex" : "hidden"} absolute top-29 right-3.5 min-w-62 flex-col items-stretch gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 md:order-3 md:static md:flex md:min-w-0 md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:md:bg-transparent`}>
          {session?.user?.role === "user" ? (
            <LoggedInUserMenu user={session.user} open={accountMenu === "user"} onToggle={() => setAccountMenu(accountMenu === "user" ? null : "user")} onClose={() => setAccountMenu(null)} onLogout={logoutUser} />
          ) : (
            <AccountMenu type="user" open={accountMenu === "user"} onToggle={() => setAccountMenu(accountMenu === "user" ? null : "user")} onClose={() => setAccountMenu(null)} />
          )}
          <AccountMenu type="admin" open={accountMenu === "admin"} onToggle={() => setAccountMenu(accountMenu === "admin" ? null : "admin")} onClose={() => setAccountMenu(null)} />
          
          <NavLink to="/cart" className="flex items-center gap-2 rounded-lg p-2 hover:text-[#2874f0] [&_svg]:size-6"><span className="relative"><CartIcon />{cartCount > 0 && <small className="absolute -top-2 -right-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] text-white">{cartCount > 99 ? "99+" : cartCount}</small>}</span><span className="md:hidden xl:inline">Cart</span></NavLink>
          <button onClick={() => setDark(!dark)} className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-3 transition dark:border-neutral-700" aria-label="Change color theme">
            <span className="[&_svg]:size-5">{dark ? <SunIcon /> : <MoonIcon />}</span>
            <span className="text-xs font-semibold">{dark ? "Light" : "Dark"}</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <nav className="mx-auto flex max-w-400 gap-2 overflow-x-auto px-4 py-3 lg:justify-center lg:px-12" aria-label="Product categories">
          {categories.map(({ label, category, path }) => (
            <Link key={label} to={path || `/search?category=${encodeURIComponent(category)}`} className="group flex min-w-22 shrink-0 flex-col items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-blue-50 dark:hover:bg-neutral-800">
              <span className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-[#2874f0] ring-1 ring-neutral-100 transition duration-200 group-hover:scale-105 group-hover:ring-[#2874f0] dark:bg-neutral-800 dark:ring-neutral-700">
                <CategoryIcon category={label} className="size-7" />
              </span>
              <span className="whitespace-nowrap text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
