// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./components/FAQ";

import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";

import CustomImageCustomizer from "./pages/CustomImageCustomizer";
import CustomizePage from "./pages/CustomizePage";

import AdminDashboard from "./pages/AdminDashboard";
import OrderHistory from "./pages/OrderHistory";

import Cart from "./pages/Cart";

import Overview from "./pages/profile/OverviewDetails";
import Addresses from "./pages/profile/Addresses";
import Settings from "./pages/profile/Settings";

import LanguageSwitcher from "@/components/LanguageSwitcher";

// ✅ Custom builder page
import Custom from "./pages/Custom";

function App() {
  return (
    <Router>
      <MainLayout>
        <LanguageSwitcher />

        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/customize-image/:id" element={<CustomImageCustomizer />} />
          <Route path="/customize/:id" element={<CustomizePage />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile/overview" element={<Overview />} />
          <Route path="/profile/addresses" element={<Addresses />} />
          <Route path="/profile/settings" element={<Settings />} />

          {/* ✅ NEW route */}
          <Route path="/custom" element={<Custom />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;