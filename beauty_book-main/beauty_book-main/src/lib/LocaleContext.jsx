import { createContext, useContext, useState, useEffect } from "react";
import { getLang, getCurrency, setGlobalLang, setGlobalCurrency, LANGUAGES, CURRENCIES, getCurrencySymbol, formatPrice } from "@/hooks/useLocale";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(getLang);
  const [currency, setCurrencyState] = useState(getCurrency);

  useEffect(() => {
    const handler = () => {
      setLangState(getLang());
      setCurrencyState(getCurrency());
    };
    window.addEventListener("bb-locale-change", handler);
    return () => window.removeEventListener("bb-locale-change", handler);
  }, []);

  const setLang = (code) => {
    setLangState(code);
    setGlobalLang(code);
  };

  const setCurrency = (code) => {
    setCurrencyState(code);
    setGlobalCurrency(code);
  };

  const currencySymbol = getCurrencySymbol(currency);
  const fmt = (priceEur) => formatPrice(priceEur, currency);
  const currentLang = LANGUAGES.find(l => l.code === lang);
  const currentCurrency = CURRENCIES.find(c => c.code === currency);

  return (
    <LocaleContext.Provider value={{
      lang, currency, setLang, setCurrency,
      currencySymbol, formatPrice: fmt,
      currentLang, currentCurrency,
      LANGUAGES, CURRENCIES,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useAppLocale() {
  return useContext(LocaleContext);
}