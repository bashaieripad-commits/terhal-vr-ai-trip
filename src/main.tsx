import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
