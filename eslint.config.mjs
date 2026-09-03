import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  // core-web-vitals only ships a subset of jsx-a11y rules. Next's config
  // already registers the jsx-a11y plugin, so we can't spread the preset's
  // flat config (duplicate plugin) — we adopt its full recommended rule set
  // instead (part of the a11y CI strategy alongside the axe scan).
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    ignores: [
      "node_modules",
      ".next",
      "out",
      "next-env.d.ts",
      "supabase/.temp",
    ],
  },
];

export default eslintConfig;