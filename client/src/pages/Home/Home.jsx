import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BestSellingProducts from "../../components/BestSellingProducts/BestSellingProducts";
import CategoryIcon from "../../components/CategoryIcon/CategoryIcon";
import DealsOfTheDay from "../../components/DealsOfTheDay/DealsOfTheDay";
import NewLaunchedProducts from "../../components/NewLaunchedProducts/NewLaunchedProducts";
import PopularProducts from "../../components/PopularProducts/PopularProducts";
import UpcomingProducts from "../../components/UpcomingProducts/UpcomingProducts";
import sliderMobiles from "../../assets/images/slider/slider-mobiles.jpg";
import sliderElectronics from "../../assets/images/slider/slider-electronics.jpg";
import sliderFashion from "../../assets/images/slider/slider-fashion.jpg";
import sliderFurniture from "../../assets/images/slider/slider-furniture.jpg";

const heroSlides = [
  { image: sliderMobiles, alt: "Featured mobile deals", category: "Mobiles" },
  { image: sliderElectronics, alt: "Featured electronics deals", category: "Electronics" },
  { image: sliderFashion, alt: "Featured fashion deals", category: "Fashion" },
  { image: sliderFurniture, alt: "Featured furniture deals", category: "Furniture" },
];

const SectionTitle = ({ eyebrow, title, link }) => (
  <div className="mb-7 flex items-end justify-between gap-4">
    <div>
      <p className="mb-2 text-xs font-extrabold tracking-[.16em] text-[#2874f0] uppercase">{eyebrow}</p>
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
    </div>
    {link && <Link to="/search" className="shrink-0 text-sm font-bold text-[#2874f0] hover:underline">View all &rarr;</Link>}
  </div>
);

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  const changeSlide = (direction) => {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="mx-auto max-w-400 space-y-7">
      {/* Hero */}
      <section className="relative left-1/2 min-h-115 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-neutral-950 shadow-xl sm:min-h-135">
        <img key={slide.image} className="absolute inset-0 size-full object-cover transition-opacity duration-500" src={slide.image} alt={slide.alt} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
        <button type="button" onClick={() => changeSlide(-1)} className="absolute top-1/2 left-4 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm transition hover:bg-[#2874f0]" aria-label="Previous slide">&#8592;</button>
        <button type="button" onClick={() => changeSlide(1)} className="absolute top-1/2 right-4 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm transition hover:bg-[#2874f0]" aria-label="Next slide">&#8594;</button>
        <div className="relative z-10 flex min-h-115 max-w-3xl flex-col justify-center px-7 py-16 text-white sm:min-h-135 sm:px-14 lg:px-20">
          <span className="mb-5 w-fit rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold tracking-[.16em] uppercase backdrop-blur-sm">Big Shopping Days</span>
          <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">Everything you love,<span className="block text-[#ffd814]">all in one place.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Discover trending electronics, fashion, home essentials and more at prices made for you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/search" className="rounded-lg bg-[#2874f0] px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600">Shop now</Link>
            <Link to={`/search?category=${encodeURIComponent(slide.category)}`} className="rounded-lg border border-white/40 bg-white/10 px-7 py-3.5 font-bold backdrop-blur-sm transition hover:bg-white hover:text-neutral-900">Explore deals</Link>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label="Hero slides">{heroSlides.map((item, index) => <button type="button" key={item.category} onClick={() => setActiveSlide(index)} aria-label={`Show ${item.category} slide`} className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[#ffd814]" : "w-2 bg-white/60"}`} />)}</div>
      </section>

      
      <BestSellingProducts />

      {/* 3. Deal banners */}
      <section className="grid gap-5 lg:grid-cols-3">
        {[["Beauty Essentials", "Up to 50% off", "bg-pink-100 dark:bg-pink-950/40", "text-pink-600"], ["Home Appliances", "Save up to ₹10,000", "bg-cyan-100 dark:bg-cyan-950/40", "text-cyan-700"], ["Fresh Grocery", "Delivered daily", "bg-green-100 dark:bg-green-950/40", "text-green-700"]].map(([title, offer, color, iconColor]) => (
          <Link key={title} to={`/search?category=${title}`} className={`${color} group flex min-h-55 items-center overflow-hidden rounded-2xl p-6`}>
            <div className="z-10 w-1/2"><p className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-300">Limited offer</p><h3 className="mt-2 text-2xl font-extrabold">{title}</h3><p className="mt-2 font-bold text-[#2874f0]">{offer}</p><span className="mt-5 inline-block text-sm font-bold">Shop now &rarr;</span></div>
            <div className="flex w-1/2 items-center justify-center"><span className={`flex size-28 items-center justify-center rounded-full bg-white/70 shadow-sm transition duration-300 group-hover:scale-110 dark:bg-white/10 ${iconColor}`}><CategoryIcon category={title} className="size-16" /></span></div>
          </Link>
        ))}
      </section>

      <NewLaunchedProducts />

      {/* 5. Promotional feature */}
      <section className="relative grid overflow-hidden rounded-2xl bg-[#172337] text-white lg:grid-cols-2">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="text-xs font-extrabold tracking-[.16em] text-yellow-400 uppercase">Upgrade your ride</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Move smarter. Save bigger.</h2>
          <p className="mt-5 max-w-lg leading-7 text-white/65">Explore efficient two wheelers with easy EMI options, verified sellers and doorstep support.</p>
          <Link to="/search?category=Two%20Wheelers" className="mt-7 w-fit rounded-lg bg-yellow-400 px-6 py-3 font-bold text-neutral-900 transition hover:bg-yellow-300">Explore two wheelers</Link>
        </div>
        <div className="flex min-h-80 items-center justify-center bg-gradient-to-br from-blue-100 to-white p-8"><CategoryIcon category="Two Wheelers" className="size-56 text-[#2874f0]" /></div>
      </section>

      <UpcomingProducts />

      {/* 6. Customer reviews */}
      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-8">
        <SectionTitle eyebrow="Trusted shopping" title="What our customers say" />
        <div className="grid gap-5 md:grid-cols-3">
          {[["Aarav Shah", "The delivery was faster than expected and the product quality was excellent."], ["Riya Patel", "Easy checkout, clear tracking and a completely hassle-free return experience."], ["Kabir Mehta", "Great offers across categories. This has become my first stop for online shopping."]].map(([name, review], index) => (
            <blockquote key={name} className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800">
              <div className="text-yellow-500" aria-label="5 out of 5 stars">&#9733; &#9733; &#9733; &#9733; &#9733;</div>
              <p className="mt-4 leading-7 text-neutral-600 dark:text-neutral-300">“{review}”</p>
              <footer className="mt-5 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#2874f0] font-bold text-white">{name[0]}</span><div><strong className="text-sm">{name}</strong><p className="text-xs text-neutral-500">Verified buyer #{index + 1}</p></div></footer>
            </blockquote>
          ))}
        </div>
      </section>

      <DealsOfTheDay />

      {/* 7. Newsletter */}
      <section className="rounded-2xl bg-gradient-to-r from-[#2874f0] to-blue-700 px-6 py-12 text-center text-white shadow-lg sm:px-12">
        <p className="text-xs font-bold tracking-[.16em] text-blue-100 uppercase">Never miss a deal</p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Offers worth opening your inbox for.</h2>
        <p className="mx-auto mt-4 max-w-xl text-blue-100">Get new launches, member-only prices and weekend offers delivered to you.</p>
        <form className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
          <input type="email" required placeholder="Enter your email address" className="h-13 min-w-0 flex-1 rounded-lg bg-white px-5 text-neutral-900 outline-none" />
          <button className="h-13 rounded-lg bg-yellow-400 px-7 font-extrabold text-neutral-900 transition hover:bg-yellow-300">Subscribe</button>
        </form>
      </section>

      <PopularProducts />
    </div>
  );
}