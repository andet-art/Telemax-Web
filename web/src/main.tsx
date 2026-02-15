import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./components/AuthContext";

import './i18n/i18n'; // 👈 initialize i18next here

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    
      <CartProvider>
        <AuthProvider>
        <App />
        </AuthProvider>
      </CartProvider>
    
  </StrictMode>
);
