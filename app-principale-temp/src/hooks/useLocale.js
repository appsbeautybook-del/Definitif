/**
 * useLocale — gestion centralisée de la langue et de la monnaie
 *
 * Stockage : localStorage (bb_lang, bb_currency)
 * Propagation : custom event "bb-locale-change" dispatché sur window
 *
 * Utilisation :
 *   const { lang, currency, currencySymbol, setLang, setCurrency, formatPrice } = useLocale();
 */
import { useState, useEffect } from "react";

export const LANGUAGES = [
  { code: "fr", label: "Français", sub: "French", flag: "🇫🇷", htmlLang: "fr" },
  { code: "en", label: "English", sub: "Anglais", flag: "🇬🇧", htmlLang: "en" },
  { code: "es", label: "Español", sub: "Espagnol", flag: "🇪🇸", htmlLang: "es" },
  { code: "de", label: "Deutsch", sub: "Allemand", flag: "🇩🇪", htmlLang: "de" },
  { code: "it", label: "Italiano", sub: "Italien", flag: "🇮🇹", htmlLang: "it" },
  { code: "pt", label: "Português", sub: "Portugais", flag: "🇵🇹", htmlLang: "pt" },
  { code: "ar", label: "العربية", sub: "Arabe", flag: "🇸🇦", htmlLang: "ar" },
  { code: "zh", label: "中文", sub: "Chinois", flag: "🇨🇳", htmlLang: "zh" },
];

export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro", sub: "Zone Euro", flag: "🇪🇺" },
  { code: "USD", symbol: "$", label: "Dollar américain", sub: "États-Unis", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", label: "Livre sterling", sub: "Royaume-Uni", flag: "🇬🇧" },
  { code: "CHF", symbol: "CHF", label: "Franc suisse", sub: "Suisse", flag: "🇨🇭" },
  { code: "CAD", symbol: "CA$", label: "Dollar canadien", sub: "Canada", flag: "🇨🇦" },
  { code: "MAD", symbol: "DH", label: "Dirham marocain", sub: "Maroc", flag: "🇲🇦" },
  { code: "XOF", symbol: "CFA", label: "Franc CFA", sub: "Afrique de l'Ouest", flag: "🌍" },
  { code: "JPY", symbol: "¥", label: "Yen japonais", sub: "Japon", flag: "🇯🇵" },
];

// Taux de conversion approximatifs (base EUR)
const RATES = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.96,
  CAD: 1.47,
  MAD: 10.8,
  XOF: 655.96,
  JPY: 163,
};

export function getLang() {
  return localStorage.getItem("bb_lang") || "fr";
}

export function getCurrency() {
  return localStorage.getItem("bb_currency") || "EUR";
}

export function getCurrencySymbol(code) {
  return CURRENCIES.find(c => c.code === (code || getCurrency()))?.symbol || "€";
}

export function convertPrice(priceEur, targetCurrency) {
  const rate = RATES[targetCurrency] ?? 1;
  return Math.round(priceEur * rate * 100) / 100;
}

export function formatPrice(priceEur, targetCurrency) {
  const cur = targetCurrency || getCurrency();
  const converted = convertPrice(priceEur, cur);
  const symbol = getCurrencySymbol(cur);
  if (cur === "JPY" || cur === "XOF") return `${Math.round(converted)}${symbol}`;
  if (cur === "CHF" || cur === "CAD") return `${converted.toFixed(2)} ${symbol}`;
  if (cur === "MAD") return `${converted.toFixed(0)} ${symbol}`;
  return `${converted % 1 === 0 ? converted : converted.toFixed(2)}${symbol}`;
}

function applyLang(langCode) {
  const found = LANGUAGES.find(l => l.code === langCode);
  if (found) {
    document.documentElement.lang = found.htmlLang;
    document.documentElement.dir = langCode === "ar" ? "rtl" : "ltr";
  }
}

export function setGlobalLang(code) {
  localStorage.setItem("bb_lang", code);
  applyLang(code);
  window.dispatchEvent(new CustomEvent("bb-locale-change", { detail: { lang: code, currency: getCurrency() } }));
}

export function setGlobalCurrency(code) {
  localStorage.setItem("bb_currency", code);
  window.dispatchEvent(new CustomEvent("bb-locale-change", { detail: { lang: getLang(), currency: code } }));
}

export function useLocale() {
  const [lang, setLangState] = useState(getLang);
  const [currency, setCurrencyState] = useState(getCurrency);

  useEffect(() => {
    // Appliquer la langue au démarrage
    applyLang(lang);

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

  return { lang, currency, currencySymbol, setLang, setCurrency, formatPrice: fmt, LANGUAGES, CURRENCIES };
}