import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="min-h-[calc(100vh-68px)] w-full px-4 py-6 transition-colors lg:px-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
