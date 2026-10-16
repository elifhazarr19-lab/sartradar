const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    video: true,
    videoCompression: 32,
    setupNodeEvents(on, config) {
      // event listeners eklenebilir
    },
  },
});