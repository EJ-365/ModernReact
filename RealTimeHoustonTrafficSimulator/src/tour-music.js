/**
 * Opt-in Tour Houston music via official YouTube IFrame Player API.
 * Large pop / hits catalog · Prev / Next · autoplay-next · draggable + minimizable.
 */

const POP_TRACKS = [
  { id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { id: 'fRh_vgS2dFE', title: 'Sorry' },
  { id: 'CevxZvSJLk8', title: 'Roar' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { id: 'YQHsXMglC9A', title: 'Hello' },
  { id: '2Vv-BfVoq4g', title: 'Perfect' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { id: '09R8_2nJtjg', title: 'Sugar' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  { id: 'RgKAFK5djSk', title: 'See You Again' },
  { id: '09tdoFH5c6A', title: 'Radioactive' },
  { id: '60ItHLz5WEA', title: 'Faded' },
  { id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { id: 'kTJczUoc26U', title: 'STAY' },
  { id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { id: '7wtfhZwyrcc', title: 'Believer' },
  { id: 'fKopy74weus', title: 'Demons' },
  { id: 'PT2_F-1esPk', title: 'The Middle' },
  { id: '0KSOMA3QBU0', title: 'Dark Horse' },
  { id: 'QJO3ROT-A4E', title: 'What Makes You Beautiful' },
  { id: 'Pkh8UtuejGw', title: 'Señorita' },
  { id: 'DyDfgMOUjCI', title: 'bad guy' },
  { id: 'HZwMX6T5Jhk', title: 'Havana' },
  { id: 'TUVcZfQe-Kw', title: 'Levitating' },
  { id: '3AtDnEC4zak', title: 'We Don\'t Talk Anymore' },
  { id: 'ru0K8uYEZWw', title: 'Can\'t Feel My Face' },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
  { id: '450p7goxZqg', title: 'All of Me' },
  { id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { id: 'y6Sxv-NsU7M', title: 'Happy' },
  { id: 'nYh-n7EOtMA', title: 'Cheap Thrills' },
  { id: 'LsoLEjrDogU', title: 'That\'s What I Like' },
  { id: 'wnJ6LuEH3A8', title: 'Watermelon Sugar' },
  { id: 'uelHwf8o7_U', title: 'Love The Way You Lie' },
  { id: 'j5-yKhDd64s', title: 'Not Afraid' },
  { id: 'XbGs_qK2PQA', title: 'Rap God' },
  { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend' },
  { id: 'pXRviuL6vMY', title: 'Stressed Out' },
  { id: 'Pw-0pbY9JeU', title: 'Ride' },
  { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  { id: 'Zi_XLOBDo_Y', title: 'Billie Jean' },
  { id: 'sOnqjkJTMaA', title: 'Thriller' },
  { id: 'kXYiU_JCYtU', title: 'Numb' },
  { id: 'eVTXPUF4Oz4', title: 'In the End' },
  { id: 'RBumgq5yVrA', title: 'Let Her Go' },
  { id: 'UUZB_XfZpQ0', title: 'Pompeii' },
  { id: 'ApXoWvfEYVU', title: 'Sunflower' },
  { id: 'r7qovpFAGrQ', title: 'Old Town Road' },
  { id: 'xpVfcZ0ZcFM', title: 'God\'s Plan' },
  { id: 'uxpDa-c-4Mc', title: 'Hotline Bling' },
  { id: 'wXhTHyIgQ_U', title: 'Circles' },
  { id: 'U3ASj1L6_sY', title: 'Easy On Me' },
  { id: 'ZmDBbnmKpqQ', title: 'drivers license' },
  { id: 'H5v3kku4y6Q', title: 'As It Was' },
  { id: 'G7KNmW9a75Y', title: 'Flowers' },
  { id: 'b1kbLwvqugk', title: 'Anti-Hero' },
  { id: 'tAGnKpE4NCI', title: 'Something Just Like This' },
  { id: 'fRh_vgS2dFE', title: 'Sorry' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { id: 'KUN5Uf9mAcU', title: 'Dance Monkey' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { id: '2Vj-tfvtQbY', title: 'The Hills' },
  { id: '1G4isv_Fylg', title: 'Paradise' },
  { id: 'YtYYpgEBdEU', title: 'Adventure of a Lifetime' },
  { id: 'fKopy74weus', title: 'Demons' },
  { id: '7wtfhZwyrcc', title: 'Believer' },
  { id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { id: '60ItHLz5WEA', title: 'Faded' },
  { id: 'RgKAFK5djSk', title: 'See You Again' },
  { id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { id: 'CevxZvSJLk8', title: 'Roar' },
  { id: 'YQHsXMglC9A', title: 'Hello' },
  { id: '2Vv-BfVoq4g', title: 'Perfect' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { id: '09R8_2nJtjg', title: 'Sugar' },
  { id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { id: 'kTJczUoc26U', title: 'STAY' },
  { id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { id: '3tmd-ClpJxA', title: 'Closer' },
  { id: '0EVVKms3cOY', title: 'Treat You Better' },
  { id: '8EJ3zbKTWQ8', title: 'New Rules' },
  { id: 'VuNIsY6JdUw', title: 'Say You Won\'t Let Go' },
  { id: 'EPo5wWmKEaI', title: 'Photograph' },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
];

/* Dedupe by video id — keep first title */
const _seen = new Set();
const TRACKS = POP_TRACKS.filter((t) => {
  if (!t.id || _seen.has(t.id)) return false;
  _seen.add(t.id);
  return true;
});

const POS_KEY = 'hts-tour-yt-pos';

function loadPos() {
  try {
    const j = JSON.parse(localStorage.getItem(POS_KEY) || '{}');
    return {
      x: Number.isFinite(+j.x) ? +j.x : null,
      y: Number.isFinite(+j.y) ? +j.y : null,
      min: !!j.min,
      autoNext: j.autoNext !== false,
    };
  } catch (e) {
    return { x: null, y: null, min: false, autoNext: true };
  }
}

function savePos(p) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
}

let ytApiPromise = null;
function loadYTApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { if (typeof prev === 'function') prev(); } catch (e) { /* ignore */ }
      resolve(window.YT);
    };
    if (!document.querySelector('script[data-hts-yt]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.dataset.htsYt = '1';
      document.head.appendChild(tag);
    }
    if (window.YT && window.YT.Player) resolve(window.YT);
  });
  return ytApiPromise;
}

export function createTourMusic() {
  let wrap = null, host = null, label = null, miniLabel = null, autoBtn = null, foot = null;
  let on = false, track = null, idx = -1, minimized = false;
  let player = null, playerReady = false, pendingId = null;
  let history = [];
  let pos = loadPos();
  let autoNext = pos.autoNext !== false;
  let advancing = false;

  function clampPos(x, y) {
    const w = wrap.offsetWidth || 240;
    const h = wrap.offsetHeight || 48;
    const maxX = Math.max(8, innerWidth - w - 8);
    const maxY = Math.max(8, innerHeight - h - 8);
    return {
      x: Math.max(8, Math.min(maxX, x)),
      y: Math.max(8, Math.min(maxY, y)),
    };
  }

  function applyPos() {
    if (!wrap) return;
    if (pos.x == null || pos.y == null) {
      wrap.classList.remove('placed');
      wrap.style.left = '';
      wrap.style.top = '';
      wrap.style.right = '';
      wrap.style.bottom = '';
      return;
    }
    const c = clampPos(pos.x, pos.y);
    pos.x = c.x; pos.y = c.y;
    wrap.classList.add('placed');
    wrap.style.left = c.x + 'px';
    wrap.style.top = c.y + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
  }

  function syncAutoBtn() {
    if (!autoBtn) return;
    autoBtn.classList.toggle('on', autoNext);
    autoBtn.textContent = autoNext ? 'Auto ▶' : 'Auto';
    autoBtn.title = autoNext ? 'Autoplay next: on' : 'Autoplay next: off';
  }

  function syncFoot() {
    if (!foot) return;
    const n = TRACKS.length;
    const i = idx >= 0 ? (idx + 1) + ' / ' + n : n + ' tracks';
    foot.textContent = 'Via YouTube · ' + i + ' · Prev / Next · Autoplay';
  }

  function setMinimized(m) {
    minimized = !!m;
    pos.min = minimized;
    if (wrap) {
      wrap.classList.toggle('min', minimized);
      const btn = wrap.querySelector('[data-yt-min]');
      if (btn) {
        btn.textContent = minimized ? '▣' : '—';
        btn.title = minimized ? 'Expand player' : 'Minimize player';
      }
    }
    savePos(pos);
    requestAnimationFrame(applyPos);
  }

  function setAutoNext(v) {
    autoNext = !!v;
    pos.autoNext = autoNext;
    savePos(pos);
    syncAutoBtn();
  }

  function ensureUi() {
    if (wrap) return;
    const css = document.createElement('style');
    css.textContent = '#tourYt{position:fixed;left:14px;bottom:14px;z-index:41;display:none;flex-direction:column;gap:6px;width:min(260px,50vw);background:rgba(14,12,10,.92);border:1px solid rgba(232,168,56,.3);border-radius:12px;padding:8px;box-shadow:0 10px 28px rgba(0,0,0,.45);font:11px/1.3 Overpass,system-ui,sans-serif;color:#f3ebe0;touch-action:none}'
      + '#tourYt.on{display:flex}#tourYt.placed{left:0;bottom:auto;right:auto}'
      + '#tourYt .hd{display:flex;align-items:center;gap:6px;cursor:grab;user-select:none;padding:2px 0 4px;border-bottom:1px solid rgba(255,236,210,.08);margin-bottom:2px}'
      + '#tourYt .hd:active{cursor:grabbing}#tourYt .hd .drag{color:#8a7e70;font-size:11px;letter-spacing:.04em}'
      + '#tourYt .hd .acts{display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}'
      + '#tourYt .host{width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#000}'
      + '#tourYt .host iframe{width:100%;height:100%;border:0;display:block}'
      + '#tourYt .body{display:flex;flex-direction:column;gap:6px}'
      + '#tourYt.min{width:auto;max-width:min(320px,78vw);padding:6px 8px}'
      + '#tourYt.min .body,#tourYt.min .foot{display:none}'
      + '#tourYt.min .hd{border:0;margin:0;padding:0}'
      + '#tourYt:not(.min) .miniTtl{display:none}'
      + '#tourYt .hdLabel{color:#8a7e70;font-weight:700;font-size:10px;letter-spacing:.04em}'
      + '#tourYt.min .hdLabel{display:none}'
      + '#tourYt .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}'
      + '#tourYt .ttl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700}'
      + '#tourYt .miniTtl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700;max-width:120px}'
      + '#tourYt button{background:rgba(255,236,210,.08);border:1px solid rgba(255,236,210,.16);color:#f3ebe0;border-radius:7px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer}'
      + '#tourYt button:hover{border-color:rgba(232,168,56,.45)}'
      + '#tourYt button.on{background:linear-gradient(135deg,#e8a838,#c96a28);border-color:transparent;color:#1a1008}'
      + '#tourYt .foot{color:#8a7e70;font-size:10px}';
    document.head.appendChild(css);
    wrap = document.createElement('div');
    wrap.id = 'tourYt';
    wrap.innerHTML = '<div class="hd" data-yt-drag="1">'
      + '<span class="drag" title="Drag">⠿</span>'
      + '<span class="hdLabel">YT MUSIC</span>'
      + '<span class="miniTtl" id="tourYtMiniTitle">Music</span>'
      + '<span class="acts">'
      + '<button type="button" data-yt-min="1" title="Minimize">—</button>'
      + '<button type="button" data-yt-prev="1" title="Previous">Prev</button>'
      + '<button type="button" data-yt-next="1" title="Next">Next</button>'
      + '<button type="button" data-yt-auto="1" title="Autoplay next">Auto ▶</button>'
      + '<button type="button" data-yt-off="1" title="Stop music">Stop</button>'
      + '</span></div>'
      + '<div class="body">'
      + '<div class="host" id="tourYtHost"></div>'
      + '<div class="row"><span class="ttl" id="tourYtTitle">Music off</span></div>'
      + '</div>'
      + '<div class="foot" id="tourYtFoot">Via YouTube · ' + TRACKS.length + ' tracks · Prev / Next · Autoplay</div>';
    document.body.appendChild(wrap);
    host = wrap.querySelector('#tourYtHost');
    label = wrap.querySelector('#tourYtTitle');
    miniLabel = wrap.querySelector('#tourYtMiniTitle');
    autoBtn = wrap.querySelector('[data-yt-auto]');
    foot = wrap.querySelector('#tourYtFoot');
    wrap.querySelector('[data-yt-prev]').addEventListener('click', (e) => { e.stopPropagation(); playPrev(); });
    wrap.querySelector('[data-yt-next]').addEventListener('click', (e) => { e.stopPropagation(); playNext(); });
    wrap.querySelector('[data-yt-off]').addEventListener('click', (e) => { e.stopPropagation(); setOn(false); });
    wrap.querySelector('[data-yt-min]').addEventListener('click', (e) => {
      e.stopPropagation();
      setMinimized(!minimized);
    });
    autoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setAutoNext(!autoNext);
    });
    bindDrag();
    syncAutoBtn();
    syncFoot();
    if (pos.min) setMinimized(true);
    applyPos();
  }

  function bindDrag() {
    let drag = null;
    wrap.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('[data-yt-drag]');
      if (!handle || e.target.closest('button,a,iframe,input')) return;
      const r = wrap.getBoundingClientRect();
      if (!wrap.classList.contains('placed')) {
        pos.x = r.left; pos.y = r.top;
        applyPos();
      }
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const c = clampPos(e.clientX - drag.dx, e.clientY - drag.dy);
      pos.x = c.x; pos.y = c.y;
      wrap.style.left = c.x + 'px';
      wrap.style.top = c.y + 'px';
    });
    const end = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null;
      savePos(pos);
    };
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);
  }

  function syncTitles() {
    const t = track ? track.title : 'Music';
    if (label) label.textContent = track ? track.title : 'Music off';
    if (miniLabel) miniLabel.textContent = t;
    syncFoot();
  }

  function onPlayerState(e) {
    if (e && e.data === 0 && autoNext && on && !advancing) {
      advancing = true;
      playNext();
      setTimeout(() => { advancing = false; }, 400);
    }
  }

  async function ensurePlayer() {
    ensureUi();
    const YT = await loadYTApi();
    if (player) return player;
    return new Promise((resolve) => {
      player = new YT.Player(host, {
        width: '100%',
        height: '100%',
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: location.origin || undefined,
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (pendingId) {
              try { player.loadVideoById({ videoId: pendingId, startSeconds: 0 }); } catch (e) { /* ignore */ }
              pendingId = null;
            }
            resolve(player);
          },
          onStateChange: onPlayerState,
          onError: () => {
            if (on && autoNext) setTimeout(() => playNext(), 250);
          },
        },
      });
    });
  }

  function loadVideo(id) {
    if (player && playerReady && typeof player.loadVideoById === 'function') {
      try { player.loadVideoById({ videoId: id, startSeconds: 0 }); return; } catch (e) { /* fall through */ }
    }
    pendingId = id;
    ensurePlayer();
  }

  function playAt(i, opts = {}) {
    ensureUi();
    const next = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    if (!opts.fromHistory && idx >= 0 && idx !== next) history.push(idx);
    if (history.length > 60) history.splice(0, history.length - 60);
    idx = next;
    track = TRACKS[idx];
    syncTitles();
    wrap.classList.add('on');
    on = true;
    applyPos();
    loadVideo(track.id);
  }

  function playNext() {
    let n = Math.floor(Math.random() * TRACKS.length);
    if (TRACKS.length > 1 && n === idx) n = (n + 1) % TRACKS.length;
    playAt(n);
  }

  function playPrev() {
    if (history.length) {
      const prev = history.pop();
      playAt(prev, { fromHistory: true });
      return;
    }
    playAt(idx <= 0 ? TRACKS.length - 1 : idx - 1, { fromHistory: true });
  }

  function playRandom() { playNext(); }

  function setOn(v) {
    ensureUi();
    on = !!v;
    if (on) {
      loadYTApi();
      playNext();
    } else {
      wrap.classList.remove('on');
      track = null;
      pendingId = null;
      syncTitles();
      try {
        if (player && playerReady && player.stopVideo) player.stopVideo();
      } catch (e) { /* ignore */ }
    }
  }

  function stop() { setOn(false); }

  return {
    setOn, playRandom, playNext, playPrev, stop,
    get on() { return on; },
    get title() { return track ? track.title : ''; },
    get trackCount() { return TRACKS.length; },
  };
}
