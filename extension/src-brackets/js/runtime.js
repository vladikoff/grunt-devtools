const BRACKETS_VERSION = "0.2.1";

var manifest = typeof(chrome) != "undefined" ? chrome.runtime.getManifest() : {version: BRACKETS_VERSION};
document.getElementById('toolsVersion').innerHTML = 'v' + manifest.version;
