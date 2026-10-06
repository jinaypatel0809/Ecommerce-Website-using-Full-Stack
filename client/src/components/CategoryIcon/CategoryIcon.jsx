const icons = {
  Mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M10 5.5h4M11 18.5h2" /></>,
  Headphones: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /></>,
  Neckband: <><path d="M6 5v6a6 6 0 0 0 12 0V5" /><path d="M6 5a2 2 0 1 0-2 2m14-2a2 2 0 1 1 2 2M9 16v3m6-3v3" /></>,
  "Men's Shoes": <><path d="M3 15c3 0 5-1 7-5l3 3c2 2 4 2 8 2v4H3v-4Z" /><path d="m10 12 2 2m1-1 2 2" /></>,
  "Women's Shoes": <><path d="M3 16c3 0 5-1 7-5l2 3c2 2 4 2 9 2v3H3v-3Z" /><path d="M10 11V7m0 0 2 2" /></>,
  "Men's Brazler": <><ellipse cx="12" cy="12" rx="7" ry="9" /><path d="M9 5c2 1 4 1 6 0m-6 14c2-1 4-1 6 0" /></>,
  "Smart Watches": <><rect x="7" y="6" width="10" height="12" rx="2" /><path d="m9 6-1-3h8l-1 3m-6 12-1 3h8l-1-3M10 10h4m-4 3h3m6-3h1v2h-1" /></>,
  "Men's Watches": <><rect x="7" y="6" width="10" height="12" rx="3" /><path d="m9 6-1-3h8l-1 3m-6 12-1 3h8l-1-3m-2-8-2 2 2 2" /></>,
  "Women's Watch": <><rect x="7" y="6" width="10" height="12" rx="3" /><path d="m9 6-1-3h8l-1 3m-6 12-1 3h8l-1-3m-2-8-2 2 2 2" /></>,
  "Beauty Essentials": <><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" /><circle cx="12" cy="12" r="4" /><path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3Z" /></>,
  "Home Appliances": <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M5 11h14M9 7v1m0 6v2" /></>,
  "Fresh Grocery": <><path d="M4 10h16l-1.5 10h-13L4 10Z" /><path d="m8 10 4-6 4 6M8 14v3m4-3v3m4-3v3" /></>,
  "Two Wheelers": <><circle cx="6" cy="16" r="3" /><circle cx="18" cy="16" r="3" /><path d="m6 16 4-7h4l4 7m-8-7 3 7h5M9 9H7m8 0h2l2 3" /></>,
};

export default function CategoryIcon({ category, className = "" }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[category]}</svg>;
}
