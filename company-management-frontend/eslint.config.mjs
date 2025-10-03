import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // 🚫 Turn off build-blocking rules
      "react/no-unescaped-entities": "off",
      "no-unused-vars": "warn", // show warning but don’t block build
      "@typescript-eslint/no-unused-vars": "warn", // same for TS
      "react-hooks/exhaustive-deps": "warn", // warn only
    },
  },
];

export default eslintConfig;
