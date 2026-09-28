// Thin shim over the extension API, intended so the rest of the code never touches
// `chrome.*` directly. NOT currently wired in: background.js, content.js, popup.js,
// dashboard.js and offscreen.js all call `chrome.*` directly rather than importing
// from here, so this is not yet an actual Firefox-portability seam — swapping to
// Firefox today means fixing each of those call sites individually, not just
// pointing this file at `browser`. Left in place as the intended target for that
// work (perceptionHost.firefox.js already exists for the perception-host half of
// the same effort), not as a claim that the seam exists yet.

const api = globalThis.browser ?? globalThis.chrome;

if (!api) {
  // Not fatal for unit tests / node; only the extension runtime needs it.
  console.warn("[browserApi] no extension API available (running outside a browser?)");
}

export const runtime = api?.runtime;
export const tabs = api?.tabs;
export const scripting = api?.scripting;
export const storageSession = api?.storage?.session;
export const storageLocal = api?.storage?.local;

/** getURL for a packaged resource (models, pages). */
export function resourceUrl(path) {
  return api?.runtime?.getURL ? api.runtime.getURL(path) : path;
}

/** Promise wrapper for sending a message to a specific tab. */
export function sendTabMessage(tabId, message) {
  return api.tabs.sendMessage(tabId, message);
}

/** Promise wrapper for runtime.sendMessage (popup <-> background). */
export function sendRuntimeMessage(message) {
  return api.runtime.sendMessage(message);
}

export default api;
