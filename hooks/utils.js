const PLUGIN_ID = "cc.fovea.cordova.openwith";

function redError(message) {
  return new Error(`"${PLUGIN_ID}" \x1b[1m\x1b[31m${message}\x1b[0m`);
}

module.exports = {
  PLUGIN_ID,
  redError,
};
