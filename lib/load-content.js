// Loads js/content.js (written for the browser as `window.SITE_CONTENT = {...}`) into Node.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const CONTENT_PATH = path.join(__dirname, "..", "js", "content.js");

function loadContent() {
  const code = fs.readFileSync(CONTENT_PATH, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: CONTENT_PATH });
  if (!sandbox.window.SITE_CONTENT) {
    throw new Error("js/content.js did not define window.SITE_CONTENT");
  }
  return sandbox.window.SITE_CONTENT;
}

module.exports = { loadContent };
