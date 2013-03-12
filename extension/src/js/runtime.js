var manifest = chrome.runtime.getManifest();
document.getElementById('toolsVersion').innerHTML = 'v' + manifest.version;
