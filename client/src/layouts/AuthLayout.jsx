import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3fb] px-4 py-10 dark:bg-neutral-950">
      <div className="absolute -top-32 -left-24 size-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-900/20" />
      <div className="absolute -right-24 -bottom-32 size-96 rounded-full bg-yellow-200/40 blur-3xl dark:bg-yellow-900/10" />
      <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 font-bold text-[#2874f0]">
        <span aria-hidden="true">&larr;</span> Back to store
      </Link>
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </main>
  );
}
