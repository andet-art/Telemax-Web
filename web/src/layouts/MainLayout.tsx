// src/layouts/MainLayout.tsx
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useActivityPing from "../hooks/useActivePing";

const MainLayout = ({ children }: { children: ReactNode }) => {
  useActivityPing(); // ✅ Pings backend every 2 min to update last_active

  const location = useLocation();
  const hideFooter = ["/signin", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
