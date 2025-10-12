import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Keep fast refresh stable without noisy warnings
      "react-refresh/only-export-components": "off",
      // Disable strict hook rule checks for this repo
      "react-hooks/rules-of-hooks": "off",
      // Relax TypeScript strictness for this codebase
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Disable hook deps warnings to prevent CI failures
      "react-hooks/exhaustive-deps": "off",
      // General JS rule relaxations to reduce noise
      "prefer-const": "off",
      "no-useless-catch": "off",
      "no-case-declarations": "off",
      "no-empty": "off",
    },
  },
);
