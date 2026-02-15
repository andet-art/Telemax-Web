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
import Payment from "./pages/Payment";  // only one import now
import CustomImageCustomizer from "./pages/CustomImageCustomizer";
import CustomizePage from "./pages/CustomizePage";
import AdminDashboard from "./pages/AdminDashboard";
import OrderHistory from "./pages/OrderHistory";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Cart from "./pages/Cart";

function App() {
  return (
    <Router>
      <MainLayout>
        {/* ✅ Moved LanguageSwitcher OUTSIDE of <Routes> */}
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
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
