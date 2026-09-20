import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowUp, ShieldCheck } from "lucide-react";
import { v2 } from "./api";
import { ErrorNotice, Loading } from "./components";
export default function PaddyPal() {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState(""),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const ask = async (text) => {
    if (busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: "user", text }]);
    setQuestion("");
    try {
      const result = await v2("/paddypal", {
        method: "POST",
        body: { question: text, language: i18n.language },
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: result.answer, sources: result.sources },
      ]);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page pal-page">
      <div className="pal-heading">
        <span className="pal-symbol">
          <Sparkles size={30} />
        </span>
        <p className="eyebrow">PaddyPal</p>
        <h1>{t("ai.greeting")}</h1>
        <p className="subtle">{t("ai.subtitle")}</p>
      </div>
      <div className="suggestions">
        {["today", "stock", "pending"].map((k) => (
          <button key={k} disabled={busy} onClick={() => ask(t("ai." + k))}>
            {t("ai." + k)}
            <ArrowUp size={16} />
          </button>
        ))}
      </div>
      <div className="conversation" aria-live="polite">
        {messages.map((m, index) => (
          <article key={index} className={`message ${m.role}`}>
            <strong>{m.role === "assistant" ? "PaddyPal" : null}</strong>
            <p>{m.text}</p>
            {m.sources?.length > 0 && (
              <small className="subtle">
                {t("ai.sources")}:{" "}
                {[...new Set(m.sources.map((s) => s.tool))].join(", ")}
              </small>
            )}
          </article>
        ))}
        {busy && <Loading />}
        <ErrorNotice error={error} />
      </div>
      <form
        className="pal-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <textarea
          required
          maxLength={2000}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("ai.placeholder")}
          aria-label={t("ai.placeholder")}
        />
        <button
          className="primary"
          disabled={busy || !question.trim()}
          aria-label={t("ai.send")}
        >
          <ArrowUp />
        </button>
      </form>
      <p className="pal-safety">
        <ShieldCheck size={16} />
        {t("ai.safety")}
      </p>
    </section>
  );
}
