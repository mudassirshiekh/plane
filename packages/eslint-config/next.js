const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    require.resolve("@vercel/style-guide/eslint/next"),
    "turbo",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  plugins: ["only-warn"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
  ],
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
  rules: {
    "no-useless-escape": "off",
    "prefer-const": "error",
    "no-irregular-whitespace": "error",
    "no-trailing-spaces": "error",
    "no-duplicate-imports": "error",
    "no-useless-catch": "warn",
    "no-case-declarations": "error",
    "no-undef": "error",
    "no-unreachable": "error",
    "arrow-body-style": ["error", "as-needed"],
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "off",
    "react/jsx-key": "error",
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/jsx-boolean-value": "error",
    "react/jsx-no-duplicate-props": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-useless-empty-export": "error",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: ["function", "variable"],
        format: ["camelCase", "snake_case", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
      },
    ],
  },
};
