import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "./components";
import "./about.css";
export default function About({ publicView = false, changeLanguage }) {
  const { t, i18n } = useTranslation();
  return <section className={`about-page ${publicView ? "about-public" : ""}`}>
    {publicView && <header className="about-toolbar"><NavLink to="/">← {t("about.back")}</NavLink><LanguageSelect value={i18n.language} onChange={changeLanguage} /></header>}
    <p className="eyebrow">{t("about.title")}</p><h1>{t("about.heading")}</h1>
    <article className="founder-card">
      <img src="/samarjit-chatterjee.jpeg" alt={t("about.portrait")} width="1280" height="853" />
      <div className="founder-copy"><p className="founder-role">{t("about.role")}</p><h2>Samarjit Chatterjee</h2><hr /><h3>{t("about.storyTitle")}</h3><p>{t("about.story")}</p></div>
    </article>
    <section className="contributor-panel" aria-labelledby="contributors-title"><h2 id="contributors-title">{t("about.contributors")}</h2><ul><li>Sreya Rana</li><li>Devbrat Nayek</li></ul></section>
  </section>;
}
