const { defineConfig } = require('cypress'); module.exports = defineConfig({ e2e: { video: true, videoCompression: 32, supportFile: false, setupNodeEvents(on, config) {} } });
