const sharedConfig = require("@plane/tailwind-config/tailwind.config");

module.exports = {
  // prefix ui lib classes to avoid conflicting with the app
  ...sharedConfig,
};
