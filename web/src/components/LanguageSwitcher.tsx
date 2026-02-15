import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  // ✅ Ensure i18n is synced with localStorage on first load
  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className="flex gap-3 text-white">
      <button
        onClick={() => handleLanguageChange("en")}
        className={i18n.language === "en" ? "font-bold underline" : ""}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange("de")}
        className={i18n.language === "de" ? "font-bold underline" : ""}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher;
