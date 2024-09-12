module.exports = {
  root: true,
  extends: ["@plane/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  settings: {
    "import/resolver": {
      typescript: {},
      node: {
        moduleDirectory: ["node_modules", "."],
      },
    },
  },
  rules: {
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling"],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "lucide-react",
            group: "external",
            position: "after",
          },
          {
            pattern: "@headlessui/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "@plane/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin", "internal", "react"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
