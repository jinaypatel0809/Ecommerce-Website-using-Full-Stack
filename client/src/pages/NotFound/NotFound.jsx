import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-300 rounded bg-white px-8 py-12 shadow-sm dark:bg-neutral-900 sm:px-16 sm:py-20">
      <h1 className="mb-3.5 text-4xl font-extrabold sm:text-6xl">404 — Page not found</h1>
      <p className="leading-7 text-neutral-600">The page you are looking for does not exist.</p>
      <Link className="mt-4 inline-block rounded bg-[#2874f0] px-5 py-3 font-semibold text-white" to="/">Back to home</Link>
    </section>
  );
}
