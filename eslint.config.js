import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores
  { ignores: [
    "dist",
    "coverage",
    "public",
    "node_modules",
    "netlify",
    "supabase/migrations/**",
  ] },

  // Application TypeScript/TSX files
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
      // Keep fast-refresh rule disabled noise in mixed files
      "react-refresh/only-export-components": "off",
      // Project policy: allow any where pragmatic
      "@typescript-eslint/no-explicit-any": "off",
      // Allow ts-ignore in legacy or third-party wrappers
      "@typescript-eslint/ban-ts-comment": "off",
      // Already enforced by TypeScript
      "@typescript-eslint/no-unused-vars": "off",
      // Allow intentionally empty blocks in placeholder logic
      "no-empty": "off",
      // Exhaustive deps is valuable but too noisy here
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Node/config files
  {
    files: [
      "**/*.{config,conf}.ts",
      "**/*.{config,conf}.{js,cjs,mjs}",
      "vite.config.ts",
      "vitest.config.ts",
      "tailwind.config.ts",
      "postcss.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
