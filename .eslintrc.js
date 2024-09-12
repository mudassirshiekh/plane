module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["@plane/eslint-config/next.js"],
  settings: {
    next: {
      rootDir: ["web/", "space/", "admin/"],
    },
  },
};
