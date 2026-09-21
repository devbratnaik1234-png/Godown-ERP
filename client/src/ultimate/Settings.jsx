import { useState } from "react";
import { useTranslation } from "react-i18next";
import { request, v2 } from "./api";
import { ErrorNotice, LanguageSelect } from "./components";
import { languages } from "../i18n";
export default function Settings({ user, setUser }) {
  const { t, i18n } = useTranslation();
  const [org, setOrg] = useState(user.organization),
    [error, setError] = useState(null),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await v2("/settings", {
        method: "PATCH",
        body: {
          name: org.name,
          defaultLanguage: org.defaultLanguage,
          secondaryLanguage: org.secondaryLanguage,
          aiEnabled: org.aiEnabled,
          enabledProviders: org.enabledProviders,
          defaultProvider: org.defaultProvider,
          paymentMode: org.paymentMode,
        },
      });
      setOrg(updated);
      setUser({ ...user, organization: updated });
      setSaved(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page settings-page">
      <div className="page-heading">
        <h1>{t("nav.settings")}</h1>
      </div>
      <ErrorNotice error={error} />
      {saved && (
        <p className="notice success" role="status">
          {t("common.saved")}
        </p>
      )}
      <div className="panel settings-panel">
        <h2>{t("settings.language")}</h2>
        <label className="check-label">
          <input
            type="checkbox"
            checked={!!sessionStorage.getItem("paddysync.temporary")}
            onChange={(e) => {
              if (e.target.checked)
                sessionStorage.setItem("paddysync.temporary", "true");
              else {
                sessionStorage.removeItem("paddysync.temporary");
                sessionStorage.removeItem("paddysync.locale");
              }
              setSaved(false);
              setOrg({ ...org });
            }}
          />
          {t("settings.temporary")}
        </label>
        <label>
          {t("settings.aiLanguage")}
          <select
            value={user.aiLanguageMode || "selected"}
            onChange={async (e) => {
              try {
                setUser(
                  await request("/auth/preferences", {
                    method: "PATCH",
                    body: {
                      preferredLanguage:
                        user.preferredLanguage || i18n.language,
                      aiLanguageMode: e.target.value,
                    },
                  }),
                );
              } catch (e) {
                setError(e);
              }
            }}
          >
            <option value="selected">{t("settings.selected")}</option>
            <option value="question">{t("settings.question")}</option>
          </select>
        </label>
      </div>
      {user.role === "admin" && (
        <form className="panel settings-panel" onSubmit={submit}>
          <h2>{t("nav.workspace")}</h2>
          <div className="form-grid">
            <label>
              {t("fields.name")}
              <input
                required
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
              />
            </label>
            <label>
              {t("settings.defaultLanguage")}
              <LanguageSelect
                value={org.defaultLanguage}
                onChange={(value) => setOrg({ ...org, defaultLanguage: value })}
              />
            </label>
            <label>
              {t("settings.secondaryLanguage")}
              <select
                value={org.secondaryLanguage}
                onChange={(e) =>
                  setOrg({ ...org, secondaryLanguage: e.target.value })
                }
              >
                <option value="">{t("settings.none")}</option>
                {Object.entries(languages).map(([code, name]) => (
                  <option value={code} key={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <hr />
          <h2>PaddyPal</h2>
          <label className="check-label">
            <input
              type="checkbox"
              checked={org.aiEnabled}
              onChange={(e) => setOrg({ ...org, aiEnabled: e.target.checked })}
            />
            {t("settings.aiEnabled")}
          </label>
          <p className="subtle">{t("settings.aiNotice")}</p>
          <hr />
          <h2>{t("settings.payments")}</h2>
          {["manual", "cashfree"].map((provider) => (
            <label className="check-label" key={provider}>
              <input
                type="checkbox"
                checked={org.enabledProviders.includes(provider)}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    enabledProviders: e.target.checked
                      ? [...org.enabledProviders, provider]
                      : org.enabledProviders.filter((p) => p !== provider),
                  })
                }
              />
              {t(`payment.${provider}`)}
            </label>
          ))}
          <div className="form-grid">
            <label>
              {t("fields.provider")}
              <select
                value={org.defaultProvider}
                onChange={(e) =>
                  setOrg({ ...org, defaultProvider: e.target.value })
                }
              >
                {org.enabledProviders.map((p) => (
                  <option key={p} value={p}>
                    {t("payment." + p)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("fields.mode")}
              <select
                value={org.paymentMode}
                onChange={(e) =>
                  setOrg({ ...org, paymentMode: e.target.value })
                }
              >
                {["test", "live"].map((m) => (
                  <option value={m} key={m}>
                    {t("payment." + m)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal-footer">
            <button className="primary" disabled={busy}>
              {t(busy ? "common.loading" : "common.save")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
