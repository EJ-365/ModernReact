// Install-as-app support shared by the homepage and the studio.
let deferred = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export const APP_VERSION = __APP_VERSION__;

export function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

export function setupInstall(btn) {
  if (!btn) return;
  if (isStandalone()) { btn.hidden = true; return; }
  btn.hidden = false;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { deferred = null; btn.hidden = true; });
  btn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === 'accepted') btn.hidden = true;
      return;
    }
    showHelp();
  });
}

function steps() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (location.protocol === 'file:') return ['Penwright has to be opened through its launcher to be installed.', 'Double-click "Start Penwright" in the Penwright folder, then click Install app again.'];
  if (ios) return ['Tap the Share button in Safari.', 'Choose "Add to Home Screen", then tap Add.'];
  if (/Android/.test(ua)) return ['Open the browser menu (three dots).', 'Tap "Install app" or "Add to Home screen".'];
  if (/Firefox\//.test(ua)) return ['Firefox on desktop can\'t install web apps.', 'Open this page in Chrome or Edge, then click Install app.'];
  if (/Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return ['In the Safari menu bar choose File, then "Add to Dock".', 'Penwright appears in your Dock and Launchpad.'];
  return ['Click the install icon at the right end of the address bar.', 'Or open the browser menu (three dots) and choose "Cast, save and share", then "Install page as app" (Chrome), or "Apps", then "Install this site as an app" (Edge).'];
}

function showHelp() {
  let d = document.getElementById('installHelp');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'installHelp';
    d.className = 'pw-dlg';
    document.body.append(d);
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  }
  const list = steps().map((s) => `<li>${s}</li>`).join('');
  d.innerHTML = `<form method="dialog"><h2>Install Penwright</h2>
    <p>Get Penwright in its own window with a desktop or home-screen icon. It keeps working offline.</p>
    <ol>${list}</ol><div class="pw-dlg-actions"><button class="btn primary" value="ok">Got it</button></div></form>`;
  d.showModal();
}
