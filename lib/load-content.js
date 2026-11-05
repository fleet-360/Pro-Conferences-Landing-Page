// Loads public/js/content.js (written for the browser as `window.SITE_CONTENT = {...}`) into Node.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const CONTENT_PATH = path.join(__dirname, "..", "public", "js", "content.js");

// Sessions with their own page; each file overrides parts of content.js
const EVENT_OVERRIDES = {
  zoom: path.join(__dirname, "..", "public", "js", "content-zoom.js")
};

function loadContent(eventKey) {
  const sandbox = vm.createContext({ window: {} });
  const files = [CONTENT_PATH];
  if (EVENT_OVERRIDES[eventKey]) files.push(EVENT_OVERRIDES[eventKey]);
  files.forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file }));
  if (!sandbox.window.SITE_CONTENT) {
    throw new Error("public/js/content.js did not define window.SITE_CONTENT");
  }
  return sandbox.window.SITE_CONTENT;
}

module.exports = { loadContent };
