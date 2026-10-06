export default function PlaceholderPage({ title }) {
  return (
    <section className="mx-auto max-w-300 rounded bg-white px-8 py-12 shadow-sm dark:bg-neutral-900 sm:px-16 sm:py-20">
      <h1 className="mb-3.5 text-4xl font-extrabold sm:text-6xl">{title}</h1>
      <p className="leading-7 text-neutral-600 dark:text-neutral-300">This page is ready for its content. The navbar stays visible above it.</p>
    </section>
  );
}
