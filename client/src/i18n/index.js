import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import bn from "./locales/bn/translation.json";
import or from "./locales/or/translation.json";
export const languages = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  or: "ଓଡ଼ିଆ",
};
const saved =
  sessionStorage.getItem("paddysync.locale") ||
  localStorage.getItem("paddysync.locale") ||
  "en";
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      or: { translation: or },
    },
    lng: languages[saved] ? saved : "en",
    fallbackLng: "en",
    supportedLngs: Object.keys(languages),
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: () => en.common.error,
  });
i18n.on("languageChanged", (lang) => {
  document.documentElement.lang = lang;
});
document.documentElement.lang = i18n.language;
export const formatMoney = (
  minor,
  language = i18n.language,
  currency = "INR",
) =>
  new Intl.NumberFormat(`${language}-IN-u-nu-latn`, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(minor) / 100);
export const formatNumber = (value, language = i18n.language) =>
  new Intl.NumberFormat(`${language}-IN-u-nu-latn`, {
    maximumFractionDigits: 3,
  }).format(value);
export const formatDate = (value, language = i18n.language) =>
  new Intl.DateTimeFormat(`${language}-IN-u-nu-latn`, {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
export default i18n;
