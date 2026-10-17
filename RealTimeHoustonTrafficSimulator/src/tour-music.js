/**
 * Tour Houston music — one global shuffle pool (all styles mixed).
 * YouTube IFrame + quiet Web Audio bed if a video won't embed.
 * Floating panel, or embedded into the driver dash.
 */

const TRACKS = [
  /* Pop / mainstream */
  { id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { id: 'fRh_vgS2dFE', title: 'Sorry' },
  { id: 'CevxZvSJLk8', title: 'Roar' },
  { id: 'YQHsXMglC9A', title: 'Hello' },
  { id: '2Vv-BfVoq4g', title: 'Perfect' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { id: '09R8_2nJtjg', title: 'Sugar' },
  { id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { id: 'G7KNmW9a75Y', title: 'Flowers' },
  { id: 'kTJczUoc26U', title: 'STAY' },
  { id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { id: 'Pkh8UtuejGw', title: 'Señorita' },
  { id: 'HZwMX6T5Jhk', title: 'Havana' },
  { id: 'TUVcZfQe-Kw', title: 'Levitating' },
  { id: 'b1kbLwvqugk', title: 'Anti-Hero' },
  { id: 'H5v3kku4y6Q', title: 'As It Was' },
  { id: 'U3ASj1L6_sY', title: 'Easy On Me' },
  { id: 'KUN5Uf9mAcU', title: 'Dance Monkey' },
  { id: '3tmd-ClpJxA', title: 'Closer' },
  { id: '8EJ3zbKTWQ8', title: 'New Rules' },
  { id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { id: '0KSOMA3QBU0', title: 'Dark Horse' },
  { id: 'QJO3ROT-A4E', title: 'What Makes You Beautiful' },
  { id: 'RgKAFK5djSk', title: 'See You Again' },
  { id: 'CevxZvSJLk8', title: 'Roar' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend' },
  { id: 'PT2_F-1esPk', title: 'The Middle' },
  { id: 'nYh-n7EOtMA', title: 'Cheap Thrills' },
  { id: 'DyDfgMOUjCI', title: 'bad guy' },
  { id: 'ZmDBbnmKpqQ', title: 'drivers license' },
  { id: 'fKMkL5v6o2g', title: 'Enemy' },
  { id: '5anLPw0Efmo', title: 'Bones' },
  /* Hip-hop / R&B */
  { id: 'uelHwf8o7_U', title: 'Love The Way You Lie' },
  { id: 'j5-yKhDd64s', title: 'Not Afraid' },
  { id: 'XbGs_qK2PQA', title: 'Rap God' },
  { id: 'xpVfcZ0ZcFM', title: "God's Plan" },
  { id: 'uxpDa-c-4Mc', title: 'Hotline Bling' },
  { id: 'QK8mJJJvaes', title: 'Sicko Mode' },
  { id: 'gCYcHz2k5x0', title: 'HUMBLE.' },
  { id: 'E5yFcdPAGv0', title: 'In My Feelings' },
  { id: 'LsoLEjrDogU', title: "That's What I Like" },
  { id: '2Vj-tfvtQbY', title: 'The Hills' },
  { id: 'tnTsW-YkAYk', title: 'Lose Yourself' },
  { id: 'r7qovpFAGrQ', title: 'Old Town Road' },
  { id: 'ApXoWvfEYVU', title: 'Sunflower' },
  { id: 'wXhTHyIgQ_U', title: 'Circles' },
  { id: 'ru0K8uYEZWw', title: "Can't Feel My Face" },
  { id: '0EVVKms3cOY', title: 'Treat You Better' },
  { id: 'PIh2xe4jnpk', title: 'Adorn' },
  { id: 'U0CGsw6h60k', title: 'Earned It' },
  { id: 'yzTuBuRdAyA', title: 'No Guidance' },
  { id: 'Zi_XLOBDo_Y', title: 'Billie Jean' },
  { id: 'sOnqjkJTMaA', title: 'Thriller' },
  { id: '450p7goxZqg', title: 'All of Me' },
  { id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { id: 'EPo5wWmKEaI', title: 'Photograph' },
  { id: 'VuNIsY6JdUw', title: "Say You Won't Let Go" },
  { id: '3AtDnEC4zak', title: "We Don't Talk Anymore" },
  /* Rock / alt */
  { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  { id: 'kXYiU_JCYtU', title: 'Numb' },
  { id: 'eVTXPUF4Oz4', title: 'In the End' },
  { id: '7wtfhZwyrcc', title: 'Believer' },
  { id: '09tdoFH5c6A', title: 'Radioactive' },
  { id: 'fKopy74weus', title: 'Demons' },
  { id: 'CD-EOMCQYv8', title: 'Thunder' },
  { id: 'ktvTqknDobU', title: 'Centuries' },
  { id: '1w7OgIMMRc4', title: 'Sweet Child O Mine' },
  { id: 'tAGnKpE4NCI', title: 'Something Just Like This' },
  { id: 'SBjQ9tuuTJQ', title: 'Eye of the Tiger' },
  { id: 'pXRviuL6vMY', title: 'Stressed Out' },
  { id: 'Pw-0pbY9JeU', title: 'Ride' },
  { id: 'loez18SRdb0', title: 'Whatever It Takes' },
  { id: 'qEnfeG6MviY', title: 'Natural' },
  { id: '1G4isv_Fylg', title: 'Paradise' },
  { id: 'UUZB_XfZpQ0', title: 'Pompeii' },
  /* Electronic / dance */
  { id: '60ItHLz5WEA', title: 'Faded' },
  { id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { id: 'kOK1YAI3Igo', title: 'Animals' },
  { id: 'YqeW9_5kURI', title: 'Lean On' },
  { id: 'hHUbLv4ThOo', title: 'Clarity' },
  { id: 'iUkASdXl09Q', title: 'Levels' },
  { id: '9bZkp7q19f0', title: 'Gentleman' },
  { id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  /* Latin / global */
  { id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { id: 'NUsoVlDFqZg', title: 'Mi Gente' },
  { id: 'WNIPqafd4As', title: 'Danza Kuduro' },
  { id: '9jI-z9QN6g8', title: 'Gasolina' },
  { id: '7F37r50VUTQ', title: 'Tusa' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
  { id: 'QaXhVryxVBk', title: 'Bichota' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  /* Afrobeat */
  { id: 'CxowNxLfs8U', title: 'Calm Down' },
  { id: 'orixmxRi0Ns', title: 'Essence' },
  { id: '1X77wR1L5tE', title: 'Love Nwantiti' },
  { id: '8xg3vE8Ie_E', title: 'Last Last' },
  { id: 'hHDPHJRK5Bk', title: 'Ye' },
  { id: 'gUYA60dh6Yw', title: 'Peru' },
  { id: 'TQTgRBR5J5A', title: 'Unavailable' },
  { id: '1cQh1ccqu8M', title: 'Rush' },
  { id: 'E9c-gRSryC4', title: 'On the Low' },
  { id: 'hlObmEkvlFI', title: 'Fall' },
  { id: 'a2YFvsjGObg', title: 'Soco' },
  /* Gospel / worship */
  { id: 'dy9nwe9_xzw', title: 'Oceans (Where Feet May Fail)' },
  { id: 'JbeAVROqX0I', title: 'Way Maker' },
  { id: 'y5LvidQt3mY', title: 'Reckless Love' },
  { id: 'y_PRfAVPxC0', title: 'Goodness of God' },
  { id: 'X5qpFn_K4ZE', title: 'Amazing Grace (My Chains Are Gone)' },
  { id: '1INe_uAcXus', title: 'What a Beautiful Name' },
  { id: 'cc0ooO10vDo', title: 'Way Maker (Live)' },
  { id: 'XQtofrEV7_I', title: 'Good Good Father' },
  { id: 'nQWFzMvCfLE', title: 'Build My Life' },
  { id: '6xfGLkFJyhQ', title: 'How Great Is Our God' },
  { id: 'C2epMyo-D8E', title: '10,000 Reasons' },
  /* More hits / classics */
  { id: 'fRh_vgS2dFE', title: 'Sorry' },
  { id: '09R8_2nJtjg', title: 'Sugar' },
  { id: 'RubBee1bGLk', title: 'Happy' },
  { id: 'fLexgOxsZu0', title: 'Uptown Funk (alt)' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { id: 'YQHsXMglC9A', title: 'Hello' },
  { id: '450p7goxZqg', title: 'All of Me' },
  { id: 'RBumgq5yVrA', title: 'Let Her Go' },
  { id: '1y6smkh6c-0', title: 'Cruise' },
  { id: 'cwqgA-R1UV8', title: 'Dirt Road Anthem' },
  { id: 'rCOwoBWrP4A', title: 'Chicken Fried' },
  { id: 'VJj0QbX0j8E', title: 'Body Like a Back Road' },
  { id: '9bZkp7q19f0', title: 'Gentleman' },
  { id: 'CevxZvSJLk8', title: 'Roar' },
  { id: 'KQ6zr6kCPj8', title: 'Party Rock Anthem' },
  { id: 'fWNaR-rxAic', title: 'Call Me Maybe' },
  { id: 'iS1g8G_njx8', title: 'Titanium' },
  { id: 'lWA2pjMjpBs', title: 'Rolling in the Deep (live)' },
  { id: 'ytQ5CYE1VZw', title: 'Royals' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { id: '2vjPBrBU-TM', title: 'Chandelier' },
  { id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  { id: 'kXYiU_JCYtU', title: 'Numb' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  { id: 'eVTXPUF4Oz4', title: 'In the End' },
  { id: '7wtfhZwyrcc', title: 'Believer' },
  { id: '09tdoFH5c6A', title: 'Radioactive' },
  { id: 'fKopy74weus', title: 'Demons' },
  { id: 'CD-EOMCQYv8', title: 'Thunder' },
  { id: 'pXRviuL6vMY', title: 'Stressed Out' },
  { id: 'Pw-0pbY9JeU', title: 'Ride' },
  { id: '60ItHLz5WEA', title: 'Faded' },
  { id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { id: 'G7KNmW9a75Y', title: 'Flowers' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { id: '2Vv-BfVoq4g', title: 'Perfect' },
  { id: 'xpVfcZ0ZcFM', title: "God's Plan" },
  { id: 'gCYcHz2k5x0', title: 'HUMBLE.' },
  { id: 'ApXoWvfEYVU', title: 'Sunflower' },
  { id: 'CxowNxLfs8U', title: 'Calm Down' },
  { id: 'orixmxRi0Ns', title: 'Essence' },
  { id: 'dy9nwe9_xzw', title: 'Oceans' },
  { id: 'JbeAVROqX0I', title: 'Way Maker' },
  { id: 'y_PRfAVPxC0', title: 'Goodness of God' },
  { id: '1INe_uAcXus', title: 'What a Beautiful Name' },
  { id: 'C2epMyo-D8E', title: '10,000 Reasons' },
  { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit' },
  { id: '1w7OgIMMRc4', title: 'Sweet Child O Mine' },
  { id: 'SBjQ9tuuTJQ', title: 'Eye of the Tiger' },
  { id: 'Zi_XLOBDo_Y', title: 'Billie Jean' },
  { id: 'sOnqjkJTMaA', title: 'Thriller' },
  { id: 'tnTsW-YkAYk', title: 'Lose Yourself' },
  { id: 'XbGs_qK2PQA', title: 'Rap God' },
  { id: 'j5-yKhDd64s', title: 'Not Afraid' },
  { id: 'uelHwf8o7_U', title: 'Love The Way You Lie' },
  { id: 'NUsoVlDFqZg', title: 'Mi Gente' },
  { id: 'WNIPqafd4As', title: 'Danza Kuduro' },
  { id: '9jI-z9QN6g8', title: 'Gasolina' },
  { id: 'QaXhVryxVBk', title: 'Bichota' },
  { id: '7F37r50VUTQ', title: 'Tusa' },
  { id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { id: '1X77wR1L5tE', title: 'Love Nwantiti' },
  { id: '8xg3vE8Ie_E', title: 'Last Last' },
  { id: 'gUYA60dh6Yw', title: 'Peru' },
  { id: 'TQTgRBR5J5A', title: 'Unavailable' },
  { id: '1cQh1ccqu8M', title: 'Rush' },
  { id: 'hHDPHJRK5Bk', title: 'Ye' },
  { id: 'a2YFvsjGObg', title: 'Soco' },
  { id: 'YqeW9_5kURI', title: 'Lean On' },
  { id: 'iUkASdXl09Q', title: 'Levels' },
  { id: 'kOK1YAI3Igo', title: 'Animals' },
  { id: 'KQ6zr6kCPj8', title: 'Party Rock Anthem' },
  { id: 'fWNaR-rxAic', title: 'Call Me Maybe' },
  { id: '2vjPBrBU-TM', title: 'Chandelier' },
  { id: 'ytQ5CYE1VZw', title: 'Royals' },
  { id: 'iS1g8G_njx8', title: 'Titanium' },
  { id: 'RubBee1bGLk', title: 'Happy' },
  { id: 'RgKAFK5djSk', title: 'See You Again' },
  { id: 'b1kbLwvqugk', title: 'Anti-Hero' },
  { id: 'H5v3kku4y6Q', title: 'As It Was' },
  { id: 'kTJczUoc26U', title: 'STAY' },
  { id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { id: 'TUVcZfQe-Kw', title: 'Levitating' },
  { id: 'HZwMX6T5Jhk', title: 'Havana' },
  { id: 'Pkh8UtuejGw', title: 'Señorita' },
  { id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { id: 'KUN5Uf9mAcU', title: 'Dance Monkey' },
  { id: 'U3ASj1L6_sY', title: 'Easy On Me' },
  { id: '3tmd-ClpJxA', title: 'Closer' },
  { id: '8EJ3zbKTWQ8', title: 'New Rules' },
  { id: 'nYh-n7EOtMA', title: 'Cheap Thrills' },
  { id: 'DyDfgMOUjCI', title: 'bad guy' },
  { id: 'ZmDBbnmKpqQ', title: 'drivers license' },
  { id: 'fKMkL5v6o2g', title: 'Enemy' },
  { id: '5anLPw0Efmo', title: 'Bones' },
  { id: 'YykjpeuMNEk', title: 'Hymn for the Weekend' },
  { id: 'PT2_F-1esPk', title: 'The Middle' },
  { id: 'tAGnKpE4NCI', title: 'Something Just Like This' },
  { id: 'loez18SRdb0', title: 'Whatever It Takes' },
  { id: 'qEnfeG6MviY', title: 'Natural' },
  { id: 'ktvTqknDobU', title: 'Centuries' },
  { id: '1G4isv_Fylg', title: 'Paradise' },
  { id: 'UUZB_XfZpQ0', title: 'Pompeii' },
  { id: 'r7qovpFAGrQ', title: 'Old Town Road' },
  { id: 'wXhTHyIgQ_U', title: 'Circles' },
  { id: 'LsoLEjrDogU', title: "That's What I Like" },
  { id: '2Vj-tfvtQbY', title: 'The Hills' },
  { id: 'QK8mJJJvaes', title: 'Sicko Mode' },
  { id: 'E5yFcdPAGv0', title: 'In My Feelings' },
  { id: 'uxpDa-c-4Mc', title: 'Hotline Bling' },
  { id: 'ru0K8uYEZWw', title: "Can't Feel My Face" },
  { id: '0EVVKms3cOY', title: 'Treat You Better' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { id: 'EPo5wWmKEaI', title: 'Photograph' },
  { id: 'VuNIsY6JdUw', title: "Say You Won't Let Go" },
  { id: 'RBumgq5yVrA', title: 'Let Her Go' },
  { id: '450p7goxZqg', title: 'All of Me' },
  { id: 'y5LvidQt3mY', title: 'Reckless Love' },
  { id: 'X5qpFn_K4ZE', title: 'Amazing Grace' },
  { id: 'cc0ooO10vDo', title: 'Way Maker (Live)' },
  { id: 'XQtofrEV7_I', title: 'Good Good Father' },
  { id: 'nQWFzMvCfLE', title: 'Build My Life' },
  { id: '6xfGLkFJyhQ', title: 'How Great Is Our God' },
  { id: 'hlObmEkvlFI', title: 'Fall' },
  { id: 'E9c-gRSryC4', title: 'On the Low' },
  { id: 'hHUbLv4ThOo', title: 'Clarity' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
];

const ALL = (() => {
  const seen = new Set(), out = [];
  for (const t of TRACKS) {
    if (!t.id || seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  return out;
})();

const BED = { bpm: 110, root: 110, pattern: [1, 0, 0.5, 0, 1, 0, 0.35, 0.2], wave: 'triangle' };

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
  let wrap = null, mount = null, label = null, miniLabel = null, autoBtn = null, foot = null;
  let on = false, track = null, idx = -1, minimized = false;
  let player = null, playerReady = false, pendingId = null, wantId = null, verifyTimer = 0;
  let history = [];
  let pos = loadPos();
  let autoNext = pos.autoNext !== false;
  let advancing = false;
  let driverMode = false;
  let driverSlot = null;
  let ytOk = false;
  const listeners = new Set();
  let order = ALL.map((_, i) => i);
  shuffle(order);

  let actx = null, master = null, bedNodes = [], bedTimer = 0, bedStep = 0, bedOn = false;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function emit() {
    const snap = {
      on, title: track ? track.title : '', idx, count: ALL.length, autoNext, driverMode,
      ytOk, source: ytOk ? 'youtube' : (on ? 'bed' : 'off'),
    };
    for (const fn of listeners) { try { fn(snap); } catch (e) { /* ignore */ } }
  }

  function ensureAudio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0.18;
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') {
      try { actx.resume(); } catch (e) { /* ignore */ }
    }
    return actx;
  }

  function stopBed() {
    if (bedTimer) { clearInterval(bedTimer); bedTimer = 0; }
    for (const n of bedNodes) {
      try { n.stop(); } catch (e) { /* ignore */ }
      try { n.disconnect(); } catch (e2) { /* ignore */ }
    }
    bedNodes = [];
    bedOn = false;
  }

  function tone(freq, dur, type, gain, t0) {
    if (!actx || !master) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
    bedNodes.push(o);
    if (bedNodes.length > 32) {
      const old = bedNodes.splice(0, 12);
      for (const n of old) { try { n.stop(); } catch (e) { /* ignore */ } }
    }
  }

  function kick(t0, amt) {
    if (!actx || !master) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
    g.gain.setValueAtTime(amt, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.18);
    bedNodes.push(o);
  }

  function startBed() {
    const ctx = ensureAudio();
    if (!ctx || !on || ytOk || bedOn) return;
    stopBed();
    bedOn = true;
    bedStep = 0;
    const stepMs = (60 / BED.bpm) * 1000 / 2;
    bedTimer = setInterval(() => {
      if (!on || !actx || ytOk) return;
      const t0 = actx.currentTime + 0.02;
      const v = BED.pattern[bedStep % BED.pattern.length];
      bedStep++;
      if (v > 0.85) kick(t0, 0.24);
      if (v > 0.05) {
        const f = BED.root * (1 + ((bedStep >> 1) % 3) * 0.15);
        tone(f, 0.14, BED.wave, 0.04 * v, t0);
        tone(f * 1.5, 0.1, 'sine', 0.018 * v, t0);
      }
    }, stepMs);
    emit();
  }

  function clampPos(x, y) {
    const w = wrap.offsetWidth || 240;
    const h = wrap.offsetHeight || 48;
    return {
      x: Math.max(8, Math.min(Math.max(8, innerWidth - w - 8), x)),
      y: Math.max(8, Math.min(Math.max(8, innerHeight - h - 8), y)),
    };
  }

  function applyPos() {
    if (!wrap || driverMode) return;
    if (pos.x == null || pos.y == null) {
      wrap.classList.remove('placed');
      wrap.style.left = ''; wrap.style.top = ''; wrap.style.right = ''; wrap.style.bottom = '';
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
    const i = idx >= 0 ? (idx + 1) + ' / ' + ALL.length : ALL.length + ' songs';
    const src = !on ? 'off' : (ytOk ? 'YouTube' : 'audio bed');
    foot.textContent = 'Shuffle · ' + i + ' · ' + src;
  }

  function setMinimized(m) {
    if (driverMode) return;
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
    emit();
  }

  function ensureUi() {
    if (wrap) return;
    const css = document.createElement('style');
    css.textContent = '#tourYt{position:fixed;left:14px;bottom:14px;z-index:41;display:none;flex-direction:column;gap:6px;width:min(300px,56vw);background:rgba(14,12,10,.92);border:1px solid rgba(232,168,56,.3);border-radius:12px;padding:8px;box-shadow:0 10px 28px rgba(0,0,0,.45);font:11px/1.3 Overpass,system-ui,sans-serif;color:#f3ebe0;touch-action:none}'
      + '#tourYt.on{display:flex}#tourYt.placed{left:0;bottom:auto;right:auto}'
      /* Driver look: stay on body (fixed overlay). Never reparent — moving the YT iframe restarts audio. */
      + '#tourYt.dashEmbed{position:fixed!important;z-index:42!important;display:flex!important;max-width:none!important;'
      + 'border:2px solid #e8a838;border-radius:14px;box-shadow:0 8px 22px rgba(0,0,0,.45);margin:0;padding:8px 10px;'
      + 'pointer-events:auto!important;touch-action:auto;box-sizing:border-box;background:linear-gradient(165deg,#2a2218,#14100c)}'
      + '#tourYt.dashEmbed .hd .drag,#tourYt.dashEmbed [data-yt-min]{display:none!important}'
      + '#tourYt.dashEmbed .hd{cursor:default;border-bottom-color:rgba(232,168,56,.25)}'
      + '#tourYt .hd{display:flex;align-items:center;gap:6px;cursor:grab;user-select:none;padding:2px 0 4px;border-bottom:1px solid rgba(255,236,210,.08);margin-bottom:2px}'
      + '#tourYt .hd:active{cursor:grabbing}#tourYt .hd .drag{color:#8a7e70;font-size:11px}'
      + '#tourYt .hd .acts{display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}'
      + '#tourYt .host{display:none;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#111;flex:1;min-height:72px}'
      + '#tourYt.yt-ready .host,#tourYt.dashEmbed .host{display:block}'
      + '#tourYt.dashEmbed .host{aspect-ratio:auto;height:auto;min-height:78px;max-height:48%}'
      + '#tourYt .host iframe{width:100%;height:100%;border:0;display:block}'
      + '#tourYt .body{display:flex;flex-direction:column;gap:6px;flex:1;min-height:0}'
      + '#tourYt.min{width:auto;max-width:min(340px,82vw);padding:6px 8px}'
      + '#tourYt.min .body,#tourYt.min .foot{display:none}'
      + '#tourYt.min .hd{border:0;margin:0;padding:0}'
      + '#tourYt:not(.min) .miniTtl{display:none}'
      + '#tourYt .hdLabel{color:#e8a838;font-weight:800;font-size:11px;letter-spacing:.08em}'
      + '#tourYt.min .hdLabel{display:none}'
      + '#tourYt .row{display:flex;gap:6px;align-items:center}'
      + '#tourYt .ttl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700}'
      + '#tourYt .miniTtl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700;max-width:140px}'
      + '#tourYt button{background:rgba(255,236,210,.08);border:1px solid rgba(232,168,56,.45);color:#f3ebe0;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer}'
      + '#tourYt button:hover{border-color:rgba(232,168,56,.7)}'
      + '#tourYt button.on{background:linear-gradient(135deg,#e8a838,#c96a28);border-color:transparent;color:#1a1008}'
      + '#tourYt .foot{color:#8a7e70;font-size:10px}';
    document.head.appendChild(css);
    wrap = document.createElement('div');
    wrap.id = 'tourYt';
    wrap.innerHTML = '<div class="hd" data-yt-drag="1">'
      + '<span class="drag" title="Drag">⠿</span>'
      + '<span class="hdLabel">MUSIC</span>'
      + '<span class="miniTtl" id="tourYtMiniTitle">Music</span>'
      + '<span class="acts">'
      + '<button type="button" data-yt-min="1" title="Minimize">—</button>'
      + '<button type="button" data-yt-prev="1" title="Previous">Prev</button>'
      + '<button type="button" data-yt-next="1" title="Next">Next</button>'
      + '<button type="button" data-yt-auto="1" title="Autoplay next">Auto ▶</button>'
      + '<button type="button" data-yt-off="1" title="Stop music">Stop</button>'
      + '</span></div>'
      + '<div class="body">'
      + '<div class="host"><div id="tourYtMount"></div></div>'
      + '<div class="row"><span class="ttl" id="tourYtTitle">Music off</span></div>'
      + '</div>'
      + '<div class="foot" id="tourYtFoot">Shuffle · ' + ALL.length + ' songs</div>';
    document.body.appendChild(wrap);
    mount = wrap.querySelector('#tourYtMount');
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
      if (driverMode) return;
      const handle = e.target.closest('[data-yt-drag]');
      if (!handle || e.target.closest('button,a,iframe,input,select')) return;
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
      if (!drag || e.pointerId !== drag.id || driverMode) return;
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
    emit();
  }

  function onPlayerState(e) {
    if (e && e.data === 1) {
      ytOk = true;
      stopBed();
      syncFoot();
      emit();
    }
    if (e && e.data === 0 && autoNext && on && !advancing) {
      advancing = true;
      playNext();
      setTimeout(() => { advancing = false; }, 350);
    }
  }

  function destroyPlayer() {
    if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = 0; }
    ytOk = false;
    try {
      if (player) {
        try { if (player.stopVideo) player.stopVideo(); } catch (e0) { /* ignore */ }
        try { if (player.destroy) player.destroy(); } catch (e1) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
    player = null;
    playerReady = false;
    if (wrap) {
      wrap.classList.remove('yt-ready');
      const host = wrap.querySelector('.host');
      if (host) {
        host.innerHTML = '<div id="tourYtMount"></div>';
        mount = host.querySelector('#tourYtMount');
      }
    }
  }

  async function ensurePlayer() {
    ensureUi();
    const YT = await loadYTApi();
    if (player) return player;
    if (!mount || !mount.isConnected) {
      const host = wrap.querySelector('.host');
      if (host) {
        host.innerHTML = '<div id="tourYtMount"></div>';
        mount = host.querySelector('#tourYtMount');
      }
    }
    const startId = pendingId || wantId || undefined;
    return new Promise((resolve) => {
      player = new YT.Player(mount, {
        width: '320',
        height: '180',
        videoId: startId || undefined,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: startId ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          origin: location.origin || undefined,
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (wrap) wrap.classList.add('yt-ready');
            const id = pendingId || wantId;
            if (id) {
              try {
                player.loadVideoById({ videoId: id, startSeconds: 0 });
                if (player.playVideo) player.playVideo();
              } catch (e) { /* ignore */ }
              pendingId = null;
              verifyLoaded(id);
            }
            resolve(player);
          },
          onStateChange: onPlayerState,
          onError: () => {
            ytOk = false;
            try { if (player && player.stopVideo) player.stopVideo(); } catch (e) { /* ignore */ }
            startBed();
            syncFoot();
            emit();
            if (on) setTimeout(() => { if (!ytOk && on) playNext(); }, 700);
          },
        },
      });
    });
  }

  function verifyLoaded(id) {
    if (verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(() => {
      verifyTimer = 0;
      if (!on || wantId !== id) return;
      try {
        const data = player && playerReady && player.getVideoData && player.getVideoData();
        const cur = data && data.video_id;
        if (cur === id) {
          ytOk = true;
          stopBed();
          syncFoot();
          emit();
          return;
        }
        pendingId = id;
        destroyPlayer();
        startBed();
        ensurePlayer();
      } catch (e) {
        pendingId = id;
        destroyPlayer();
        startBed();
        ensurePlayer();
      }
    }, 1000);
  }

  function loadVideo(id) {
    wantId = id;
    pendingId = id;
    ytOk = false;
    ensureUi();
    startBed();
    if (player && playerReady && typeof player.loadVideoById === 'function') {
      try {
        try { if (player.stopVideo) player.stopVideo(); } catch (e0) { /* ignore */ }
        player.loadVideoById({ videoId: id, startSeconds: 0 });
        try { if (player.playVideo) player.playVideo(); } catch (e1) { /* ignore */ }
        pendingId = null;
        verifyLoaded(id);
        return;
      } catch (e) { /* fall through */ }
    }
    destroyPlayer();
    ensurePlayer();
  }

  function playAt(listIdx, opts = {}) {
    ensureUi();
    if (!ALL.length) return;
    const next = ((listIdx % ALL.length) + ALL.length) % ALL.length;
    if (!opts.fromHistory && idx >= 0 && idx !== next) history.push(idx);
    if (history.length > 80) history.splice(0, history.length - 80);
    idx = next;
    track = ALL[idx];
    syncTitles();
    on = true;
    syncMount();
    applyPos();
    loadVideo(track.id);
  }

  let shuffleCursor = 0;
  function playNext() {
    if (!ALL.length) return;
    if (shuffleCursor >= order.length) {
      shuffle(order);
      shuffleCursor = 0;
      /* avoid immediate repeat of last track */
      if (order.length > 1 && order[0] === idx) {
        const t = order[0]; order[0] = order[1]; order[1] = t;
      }
    }
    const n = order[shuffleCursor++];
    playAt(n);
  }

  function playPrev() {
    if (history.length) {
      playAt(history.pop(), { fromHistory: true });
      return;
    }
    playAt(idx <= 0 ? ALL.length - 1 : idx - 1, { fromHistory: true });
  }

  function playRandom() { playNext(); }

  /** Visually pin over the driver dash (left of RPM) without moving the DOM node. */
  function placeDashOverlay() {
    const dashEl = document.getElementById('tourDash');
    if (!wrap || !dashEl || !dashEl.classList.contains('on')) return;
    const r = dashEl.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const w = Math.min(r.width * 0.24, 268, window.innerWidth * 0.24);
    const h = Math.min(r.height * 0.58, 210, window.innerHeight * 0.28);
    const left = r.left + r.width * 0.016;
    const top = r.bottom - r.height * 0.14 - h;
    wrap.style.left = Math.max(4, left) + 'px';
    wrap.style.top = Math.max(4, top) + 'px';
    wrap.style.width = Math.max(160, w) + 'px';
    wrap.style.height = Math.max(120, h) + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
  }

  function syncMount() {
    ensureUi();
    if (!wrap) return;
    /* Keep #tourYt on document.body forever. appendChild into/out of #tourDash
       remounts the YouTube iframe and restarts the track on every view change. */
    if (wrap.parentNode && wrap.parentNode !== document.body) {
      document.body.appendChild(wrap);
    }
    if (driverMode) {
      const dashEl = document.getElementById('tourDash');
      if (dashEl && dashEl.classList.contains('on')) {
        wrap.classList.add('on', 'dashEmbed');
        wrap.classList.remove('placed', 'min');
        placeDashOverlay();
        return;
      }
    }
    wrap.classList.remove('dashEmbed');
    wrap.style.width = '';
    wrap.style.height = '';
    wrap.style.top = '';
    wrap.style.left = '';
    wrap.style.bottom = '';
    if (on) {
      wrap.classList.add('on');
      if (pos.min) wrap.classList.add('min');
      applyPos();
    } else {
      wrap.classList.remove('on');
    }
  }

  function setOn(v) {
    ensureUi();
    const want = !!v;
    if (want === on) {
      /* Already in this state — do not reload / restart the current track */
      syncMount();
      emit();
      return;
    }
    on = want;
    if (on) {
      loadYTApi();
      ensureAudio();
      if (!track) playNext();
      else if (track.id) loadVideo(track.id);
      else startBed();
    } else {
      track = null;
      pendingId = null;
      ytOk = false;
      stopBed();
      syncTitles();
      try {
        if (player && playerReady && player.stopVideo) player.stopVideo();
      } catch (e) { /* ignore */ }
    }
    syncMount();
    emit();
  }

  function stop() { setOn(false); }

  function setDriverMode(v, slot) {
    ensureUi();
    const next = !!v;
    const nextSlot = next && slot ? slot : null;
    if (driverMode === next && driverSlot === nextSlot) {
      if (next) syncMount();
      return;
    }
    driverMode = next;
    driverSlot = nextSlot;
    syncMount();
    emit();
  }

  /** Put player inside the driver dash (left of RPM). */
  function pinToDriverSlot(slot) {
    ensureUi();
    if (slot) driverSlot = slot;
    if (!driverMode) {
      driverMode = true;
      syncMount();
      emit();
    } else {
      syncMount();
    }
  }

  function clearDriverPin() {
    if (!driverMode) return;
    driverMode = false;
    driverSlot = null;
    syncMount();
    emit();
  }

  /* Keep API stable for tour.js (genre APIs become no-ops) */
  function setGenre() { /* genres removed — global shuffle only */ }

  function subscribe(fn) {
    listeners.add(fn);
    try {
      fn({
        on, title: track ? track.title : '', idx, count: ALL.length, autoNext, driverMode,
        ytOk, source: ytOk ? 'youtube' : (on ? 'bed' : 'off'),
      });
    } catch (e) { /* ignore */ }
    return () => listeners.delete(fn);
  }

  return {
    setOn, playRandom, playNext, playPrev, stop, setGenre, setDriverMode, setAutoNext,
    pinToDriverSlot, clearDriverPin, subscribe,
    get on() { return on; },
    get title() { return track ? track.title : ''; },
    get genre() { return 'all'; },
    get genres() { return []; },
    get trackCount() { return ALL.length; },
    get driverMode() { return driverMode; },
  };
}
