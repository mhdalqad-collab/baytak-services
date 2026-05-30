import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { interpolate, translations } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("baytak-language") || "en");
  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("baytak-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  const value = useMemo(() => {
    function t(key, values) {
      const template = translations[language]?.[key] || translations.en[key] || key;
      return values ? interpolate(template, values) : template;
    }

    function serviceName(name) {
      const key = `service.${name}.name`;
      const translated = t(key);
      return translated === key ? name : translated;
    }

    function serviceDescription(name, fallback) {
      const translated = t(`service.${name}.description`);
      return translated === `service.${name}.description` ? fallback : translated;
    }

    function locationName(name) {
      const key = `location.${name}`;
      const translated = t(key);
      return translated === key ? name : translated;
    }

    function statusName(name) {
      const key = `status.${name}`;
      const translated = t(key);
      return translated === key ? name : translated;
    }

    function providerType(type) {
      const key = `provider.${type}`;
      const translated = t(key);
      return translated === key ? type : translated;
    }

    return {
      direction,
      isArabic: language === "ar",
      language,
      locationName,
      providerType,
      serviceDescription,
      serviceName,
      setLanguage,
      statusName,
      t
    };
  }, [direction, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
