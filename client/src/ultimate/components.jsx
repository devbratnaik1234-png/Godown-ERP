import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Inbox, LoaderCircle } from "lucide-react";
import { languages } from "../i18n";
export function LanguageSelect({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <select
      className="language-select"
      aria-label={t("settings.language")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.entries(languages).map(([code, name]) => (
        <option value={code} key={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
export function ErrorNotice({ error }) {
  const { t, i18n } = useTranslation();
  return error ? (
    <div className="notice error" role="alert">
      {t(
        i18n.exists(`errors.${error.code}`)
          ? `errors.${error.code}`
          : "common.error",
      )}
    </div>
  ) : null;
}
export function Loading() {
  const { t } = useTranslation();
  return (
    <div className="empty" role="status">
      <LoaderCircle className="spin" />
      <span>{t("common.loading")}</span>
    </div>
  );
}
export function Empty() {
  const { t } = useTranslation();
  return (
    <div className="empty">
      <Inbox size={36} />
      <strong>{t("common.empty")}</strong>
      <p>{t("common.emptyHelp")}</p>
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const cancel = (e) => {
      e.preventDefault();
      closeRef.current();
    };
    dialog.addEventListener("cancel", cancel);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.close();
    };
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-labelledby="dialog-title">
      <div className="modal-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t("common.close")}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Badge({ value, namespace = "status" }) {
  const { t, i18n } = useTranslation();
  return (
    <span
      className={`badge ${["SUCCESS", "MATCHED", "Completed", "Active"].includes(value) ? "success" : ["FAILED", "DISPUTED", "REQUIRES_REVIEW"].includes(value) ? "warning" : ""}`}
    >
      {i18n.exists(`${namespace}.${value}`)
        ? t(`${namespace}.${value}`)
        : value}
    </span>
  );
}
