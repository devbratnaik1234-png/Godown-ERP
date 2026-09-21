import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resources } from "../src/ultimate/resources.js";
const flatten = (obj, prefix = "") =>
  Object.fromEntries(
    Object.entries(obj).flatMap(([key, value]) =>
      typeof value === "string"
        ? [[prefix + key, value]]
        : Object.entries(flatten(value, prefix + key + ".")),
    ),
  );
const locales = Object.fromEntries(
  ["en", "hi", "bn", "or"].map((lang) => [
    lang,
    flatten(
      JSON.parse(
        readFileSync(
          new URL(
            `../src/i18n/locales/${lang}/translation.json`,
            import.meta.url,
          ),
        ),
      ),
    ),
  ]),
);
for (const [lang, entries] of Object.entries(locales)) {
  assert.deepEqual(
    Object.keys(entries).sort(),
    Object.keys(locales.en).sort(),
    `${lang} missing or extra keys`,
  );
  for (const [key, value] of Object.entries(entries)) {
    assert.ok(value.trim(), `${lang}:${key} empty`);
    assert.deepEqual(
      value.match(/{{\w+}}/g) || [],
      locales.en[key].match(/{{\w+}}/g) || [],
      `${lang}:${key} interpolation differs`,
    );
  }
}
for (const config of Object.values(resources)) {
  assert.ok(locales.en[config.title]);
  for (const key of [
    ...config.columns,
    ...(config.fields || []).map((f) => f.key),
  ])
    assert.ok(
      locales.en[
        ["email", "password"].includes(key) ? `login.${key}` : `fields.${key}`
      ],
      `Missing field ${key}`,
    );
}
console.log(
  `Locale parity verified: ${Object.keys(locales.en).length} keys × 4 languages; resource labels and interpolation checked.`,
);
