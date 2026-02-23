import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ✅ Import JSON namespaces
import enHome from "./en/home.json";
import enAbout from "./en/about.json";
import enNavbar from "./en/navbar.json";
import enFooter from "./en/footer.json";

import deHome from "./de/home.json";
import deAbout from "./de/about.json";
import deNavbar from "./de/navbar.json";
import deFooter from "./de/footer.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          ...enHome,
          ...enAbout,
          ...enNavbar,
          ...enFooter,
        },
      },
      de: {
        translation: {
          ...deHome,
          ...deAbout,
          ...deNavbar,
          ...deFooter,
        },
      },
    },

    lng: localStorage.getItem("i18nextLng") || "en",
    fallbackLng: "en",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;