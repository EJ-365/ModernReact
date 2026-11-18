/**
 * Pass 3: fill remaining misses with alternate verified YouTube IDs (oEmbed).
 * If original still unavailable → same-artist / same-vibe alt.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
const hay = () => s.toLowerCase();

function has(re) {
  return re.test(hay());
}

async function oembed(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** slots: detect regex, candidates [{g,id,title,a}, ...] tried in order */
const slots = [
  {
    name: 'This Is What It Feels Like',
    re: /this is what it feels like/,
    cands: [
      { g: 'electronic', id: 'S63YRJpD660', title: 'This Is What It Feels Like', a: 'Armin van Buuren ft. Trevor Guthrie' },
      { g: 'electronic', id: 'BR_DFMUzX4E', title: 'This Is What It Feels Like', a: 'Armin van Buuren ft. Trevor Guthrie' },
      { g: 'electronic', id: 'MS1a-SQd79w', title: 'This Is What It Feels Like', a: 'Armin van Buuren ft. Trevor Guthrie' },
      { g: 'electronic', id: '0BC4ocEGZOI', title: 'This Is What It Feels Like (Radio Edit)', a: 'Armin van Buuren' },
      { g: 'electronic', id: 'YqH4eNzTm2M', title: 'Ping Pong', a: 'Armin van Buuren' },
    ],
  },
  {
    name: 'Where Have You Been',
    re: /where have you been/,
    cands: [
      { g: 'pop', id: 'HBxt_v0cjL0', title: 'Where Have You Been', a: 'Rihanna' },
      { g: 'pop', id: 'tuXE6mMetWQ', title: 'Where Have You Been', a: 'Rihanna' },
      { g: 'pop', id: 'lWA2fjXjcBM', title: 'Diamonds', a: 'Rihanna' },
      { g: 'pop', id: 'CvBfHwUxHIk', title: 'Only Girl (In The World)', a: 'Rihanna' },
      { g: 'pop', id: 'ehcUmQ-eGpg', title: 'Umbrella', a: 'Rihanna' },
    ],
  },
  {
    name: 'If I Lose Myself',
    re: /if i lose myself/,
    cands: [
      { g: 'electronic', id: 'Dhbt-RzVPBI', title: 'If I Lose Myself', a: 'OneRepublic & Alesso' },
      { g: 'electronic', id: '8uJW7mXjYqE', title: 'If I Lose Myself (Alesso Remix)', a: 'OneRepublic' },
      { g: 'electronic', id: 'rrZ3UbfVGFc', title: 'Under Control', a: 'Calvin Harris & Alesso' },
      { g: 'electronic', id: 'h7ARLC7bMDw', title: 'Years', a: 'Alesso' },
      { g: 'pop', id: 'IhP3J0cYLXU', title: 'Counting Stars', a: 'OneRepublic' },
    ],
  },
  {
    name: 'Reload',
    re: /\breload\b(?! \/)/,
    cands: [
      { g: 'electronic', id: 'vB7OSoVQw_g', title: 'Reload', a: 'Sebastian Ingrosso, Tommy Trash & John Martin' },
      { g: 'electronic', id: '9P8dpdwnzHY', title: 'Reload', a: 'Sebastian Ingrosso & Tommy Trash' },
      { g: 'electronic', id: 'egnR7tKb7yk', title: 'Reload (Vocal Version)', a: 'Sebastian Ingrosso & Tommy Trash' },
      { g: 'electronic', id: 'n4RjJKxsamQ', title: 'Save The World', a: 'Swedish House Mafia' },
    ],
  },
  {
    name: 'Calling',
    re: /calling \(lose my mind\)|lose my mind.*alesso|alesso.*calling/,
    cands: [
      { g: 'electronic', id: 'kmatdACwqT4', title: 'Calling (Lose My Mind)', a: 'Sebastian Ingrosso, Alesso & Ryan Tedder' },
      { g: 'electronic', id: '6JCLY0STyzM', title: 'Calling', a: 'Sebastian Ingrosso & Alesso' },
      { g: 'electronic', id: 'h7ARLC7bMDw', title: 'Years', a: 'Alesso ft. Matthew Koma' },
      { g: 'electronic', id: 'iP6XpLQM2Cs', title: 'Heroes (we could be)', a: 'Alesso ft. Tove Lo' },
    ],
  },
  {
    name: 'Some of Your Love',
    re: /some of your love/,
    cands: [
      { g: 'soul', id: 'QDy3yc1L1bw', title: 'Some of Your Love', a: 'PARTYNEXTDOOR' },
      { g: 'soul', id: 'oRdxUFDoQe0', title: 'Recognize', a: 'PARTYNEXTDOOR ft. Drake' },
      { g: 'soul', id: 'GczV6h7Kp0A', title: 'Come and See Me', a: 'PARTYNEXTDOOR ft. Drake' },
      { g: 'soul', id: 'hH9Y9jO3d3I', title: 'Recognize', a: 'PARTYNEXTDOOR' },
    ],
  },
  {
    name: 'Dreamin',
    re: /\bdreamin\b|come and see me/,
    cands: [
      { g: 'soul', id: 'GczV6h7Kp0A', title: 'Come and See Me', a: 'PARTYNEXTDOOR ft. Drake' },
      { g: 'soul', id: 'oRdxUFDoQe0', title: 'Recognize', a: 'PARTYNEXTDOOR ft. Drake' },
      { g: 'soul', id: 'lXYq9ImJIN8', title: 'Break From Toronto', a: 'PARTYNEXTDOOR' },
    ],
  },
  {
    name: 'on one tonight',
    re: /on one tonight/,
    cands: [
      { g: 'hiphop', id: '4Vaq9XX3j6E', title: 'on one tonight', a: 'Gunna' },
      { g: 'hiphop', id: 'begbi44ZLqw', title: 'fukumean vibe alt – bittersweet', a: 'Gunna' },
      { g: 'hiphop', id: '3QwZjhHcLZk', title: 'pushin P', a: 'Gunna & Future & Young Thug' },
      { g: 'hiphop', id: 'pbMELMGQXe4', title: 'Drip or Drown', a: 'Gunna' },
    ],
  },
  {
    name: 'Hong Kong',
    re: /hong kong/,
    cands: [
      { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights', a: 'The Weeknd' },
      { g: 'pop', id: 'yzTuBuRdAyA', title: 'Save Your Tears (Remix)', a: 'The Weeknd' },
      { g: 'pop', id: 'IdneKLhsWOQ', title: 'I Feel It Coming', a: 'The Weeknd ft. Daft Punk' },
      { g: 'pop', id: 'UXL6QVnArl4', title: 'Die For You', a: 'The Weeknd' },
    ],
  },
  {
    name: 'Wait M83',
    re: /\bwait\b.*m83|m83.*\bwait\b/,
    cands: [
      { g: 'electronic', id: '1oHNdKl1xKE', title: 'Wait', a: 'M83' },
      { g: 'electronic', id: 'dX3k_QDnzHE', title: 'Midnight City', a: 'M83' },
      { g: 'electronic', id: 'YykjpewL_gQ', title: 'Solitude', a: 'M83' },
      { g: 'electronic', id: '2OEL4P1Rz04', title: 'We Own The Sky', a: 'M83' },
    ],
  },
  {
    name: 'Outro M83',
    re: /outro.*m83|m83.*outro/,
    cands: [
      { g: 'electronic', id: 'wA5hZyH9VBw', title: 'Outro', a: 'M83' },
      { g: 'electronic', id: '2OEL4P1Rz04', title: 'We Own The Sky', a: 'M83' },
      { g: 'electronic', id: 'YykjpewL_gQ', title: 'Solitude', a: 'M83' },
      { g: 'electronic', id: 'GCdwKhFsLLw', title: 'My Tears Are Becoming A Sea', a: 'M83' },
    ],
  },
  {
    name: 'Forever Young Alphaville',
    re: /forever young.*alphaville|alphaville.*forever/,
    cands: [
      { g: 'classics', id: '4Nfa0E5g5qM', title: 'Forever Young', a: 'Alphaville' },
      { g: 'classics', id: 't1TcDHrkQYg', title: 'Forever Young', a: 'Alphaville' },
      { g: 'classics', id: 'AeGAhS1U1fM', title: 'Forever Young', a: 'Alphaville' },
      { g: 'classics', id: 'Kzq15y2J4UM', title: 'Young Forever', a: 'JAY-Z ft. Mr Hudson' },
    ],
  },
  {
    name: 'Runaway AURORA',
    re: /runaway.*aurora|aurora.*runaway/,
    cands: [
      { g: 'pop', id: 'd_HlPboLIjI', title: 'Runaway', a: 'AURORA' },
      { g: 'pop', id: 'OMOGaugKpzs', title: 'Runaway', a: 'AURORA' },
      { g: 'pop', id: 'a4OwEwZ8oQs', title: 'Runaway', a: 'AURORA' },
      { g: 'pop', id: 'BT4nAdI6AI0', title: 'Running With The Wolves', a: 'AURORA' },
      { g: 'pop', id: '2vjPBrBU-TM', title: 'Chandelier', a: 'Sia' },
    ],
  },
  {
    name: 'Voodoo',
    re: /voodoo.*chisway|chisway|jzyno.*voodoo|\bvoodoo\b/,
    cands: [
      { g: 'afrobeat', id: 'MCMyKcUNR8w', title: 'Voodoo vibe – WHY LOVE', a: 'Asake' },
      { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down', a: 'Rema' },
      { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
    ],
  },
  {
    name: 'prada dem',
    re: /prada dem/,
    cands: [
      { g: 'hiphop', id: 'pbMELMGQXe4', title: 'Drip or Drown', a: 'Gunna' },
      { g: 'hiphop', id: '3QwZjhHcLZk', title: 'pushin P', a: 'Gunna & Future & Young Thug' },
      { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
      { g: 'hiphop', id: 'begbi44ZLqw', title: 'bank account vibe – Metro', a: 'Gunna' },
    ],
  },
  {
    name: 'On & On',
    re: /on & on|on and on.*cartoon|cartoon.*daniel levi/,
    cands: [
      { g: 'electronic', id: 'H7rtLqqyrQk', title: 'On & On', a: 'Cartoon, Jéja ft. Daniel Levi' },
      { g: 'electronic', id: '60ItHLz5WEA', title: 'Faded', a: 'Alan Walker' },
      { g: 'electronic', id: 'cHHLHGNpCSA', title: 'Waiting For Love', a: 'Avicii' },
      { g: 'electronic', id: 'IcrbM1l_BoI', title: 'Wake Me Up', a: 'Avicii' },
    ],
  },
  {
    name: "CAN'T SAY",
    re: /can't say|cant say/,
    cands: [
      { g: 'hiphop', id: '7FuJFwpRE98', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
      { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps', a: 'Travis Scott' },
      { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE', a: 'Travis Scott' },
      { g: 'hiphop', id: 'orJSJGHjBLI', title: 'Had Enough', a: 'Don Toliver' },
    ],
  },
  {
    name: 'Gut Genug',
    re: /gut genug/,
    cands: [
      { g: 'pop', id: 'oiKj0Z_Xnjc', title: 'papaoutai', a: 'Stromae' },
      { g: 'pop', id: 'VHoT4N43jK8', title: 'Alors on danse', a: 'Stromae' },
      { g: 'pop', id: 'o3mP3mJDL2k', title: 'tous les mêmes', a: 'Stromae' },
      { g: 'pop', id: '51zjlMhdSTE', title: 'Espresso', a: 'Sabrina Carpenter' },
    ],
  },
  {
    name: 'Dimension',
    re: /dimension.*jae|jae5|dimension.*skepta/,
    cands: [
      { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down (Remix)', a: 'Rema & Selena Gomez' },
      { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
    ],
  },
  {
    name: 'Shutdown',
    re: /\bshutdown\b/,
    cands: [
      { g: 'hiphop', id: 'peGxBM_KS9M', title: 'Shutdown', a: 'Skepta' },
      { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
      { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
      { g: 'hiphop', id: 'QHb0PwCQPxg', title: 'Sprinter', a: 'Dave & Central Cee' },
    ],
  },
  {
    name: 'Without You Guetta',
    re: /without you.*guetta|guetta.*without|usher.*without you/,
    cands: [
      { g: 'electronic', id: 'jUe8uo4D4MI', title: 'Without You', a: 'David Guetta ft. Usher' },
      { g: 'electronic', id: '5dbEhBKGOtY', title: 'Play Hard', a: 'David Guetta ft. Ne-Yo & Akon' },
      { g: 'electronic', id: 'hT_nvWreIhg', title: 'Titanium', a: 'David Guetta ft. Sia' },
      { g: 'electronic', id: 'b4ozdiGhsNM', title: "I'm Good (Blue)", a: 'David Guetta & Bebe Rexha' },
    ],
  },
  {
    name: 'Plot Twist',
    re: /plot twist/,
    cands: [
      { g: 'hiphop', id: 'U9BwWKXjVaI', title: 'Nice For What', a: 'Drake' },
      { g: 'hiphop', id: 'uxpfa-e0mXc', title: 'In My Feelings', a: 'Drake' },
      { g: 'hiphop', id: 'xpVfcZ0ZcFM', title: "God's Plan", a: 'Drake' },
      { g: 'hiphop', id: 'JFm7YDVlqnI', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
    ],
  },
  {
    name: 'Check Yo Self',
    re: /check yo self/,
    cands: [
      { g: 'hiphop', id: '3g4daf0asxE', title: 'Check Yo Self', a: 'Ice Cube' },
      { g: 'hiphop', id: 'ZSs9cQqcP2w', title: 'You Know How We Do It', a: 'Ice Cube' },
      { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
      { g: 'hiphop', id: 'SQCSxqScSVQ', title: "Gangsta's Paradise", a: 'Coolio ft. L.V.' },
    ],
  },
  {
    name: 'You Know How We Do It',
    re: /you know how we do it/,
    cands: [
      { g: 'hiphop', id: 'ZSs9cQqcP2w', title: 'You Know How We Do It', a: 'Ice Cube' },
      { g: 'hiphop', id: '3g4daf0asxE', title: 'Check Yo Self', a: 'Ice Cube' },
      { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
      { g: 'hiphop', id: 'SQCSxqScSVQ', title: "Gangsta's Paradise", a: 'Coolio ft. L.V.' },
    ],
  },
  {
    name: 'ZEZE',
    re: /\bzeze\b/,
    cands: [
      { g: 'hiphop', id: 'mIXXAHnz0mE', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
      { g: 'hiphop', id: 'SDxcl9iZYUA', title: 'Bad and Boujee', a: 'Migos ft. Lil Uzi Vert' },
      { g: 'hiphop', id: 'Om0rYw6qzb8', title: 'Hotel Lobby', a: 'Quavo & Takeoff' },
      { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE', a: 'Travis Scott' },
    ],
  },
  {
    name: 'Ameyatchi',
    re: /ameyatchi/,
    cands: [
      { g: 'afrobeat', id: 'yEDHimUB4A4', title: 'Active (Alt)', a: 'Asake ft. Rema & Travis Scott' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
      { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
    ],
  },
  {
    name: 'Burukutu',
    re: /burukutu/,
    cands: [
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
      { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down', a: 'Rema' },
      { g: 'afrobeat', id: 'yEDHimUB4A4', title: 'Active (Alt)', a: 'Asake' },
    ],
  },
  {
    name: 'Jaiye',
    re: /\bjaiye\b/,
    cands: [
      { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down (Remix)', a: 'Rema & Selena Gomez' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
    ],
  },
  {
    name: 'Bobo',
    re: /\bbobo\b/,
    cands: [
      { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
      { g: 'afrobeat', id: 'MCMyKcUNR8w', title: 'WHY LOVE', a: 'Asake' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
      { g: 'afrobeat', id: 'yEDHimUB4A4', title: 'Lonely At The Top vibe', a: 'Asake' },
    ],
  },
  {
    name: 'Wo Olamide',
    re: /\bwo!\b|olamide - wo/,
    cands: [
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down', a: 'Rema' },
      { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
    ],
  },
  {
    name: 'Melo Melo',
    re: /melo melo/,
    cands: [
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down (Remix)', a: 'Rema & Selena Gomez' },
      { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
      { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
    ],
  },
  {
    name: 'If Love Is A Crime',
    re: /if love is a crime/,
    cands: [
      { g: 'afrobeat', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
      { g: 'afrobeat', id: 'WTJSt4wP2ME', title: "Wavin' Flag", a: "K'NAAN" },
      { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
    ],
  },
  {
    name: 'What Happened to Virgil',
    re: /what happened to virgil/,
    cands: [
      { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
      { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
      { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
      { g: 'hiphop', id: 'JFm7YDVlqnI', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
    ],
  },
  {
    name: 'Backdoor',
    re: /\bbackdoor\b/,
    cands: [
      { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
      { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
      { g: 'hiphop', id: 'JFm7YDVlqnI', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
      { g: 'hiphop', id: 'WILNIXZr2oc', title: 'MIDDLE CHILD', a: 'J. Cole' },
    ],
  },
  {
    name: '3 Headed Goat',
    re: /3 headed goat|three headed goat/,
    cands: [
      { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
      { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
      { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
      { g: 'hiphop', id: 'JFm7YDVlqnI', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
    ],
  },
  {
    name: 'Martin & Gina',
    re: /martin & gina|martin and gina/,
    cands: [
      { g: 'hiphop', id: 'mA0w8jZ5v8E', title: 'Martin & Gina', a: 'Polo G' },
      { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
      { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
      { g: 'hiphop', id: 'fPEXSSJZJDw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
    ],
  },
  {
    name: 'RAPSTAR',
    re: /rapstar/,
    cands: [
      { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
      { g: 'hiphop', id: 'mA0w8jZ5v8E', title: 'Martin & Gina', a: 'Polo G' },
      { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
      { g: 'hiphop', id: 'fPEXSSJZJDw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
    ],
  },
  {
    name: 'My Darling Chella',
    re: /my darling/,
    cands: [
      { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
      { g: 'afrobeat', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down', a: 'Rema' },
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
    ],
  },
  {
    name: 'Iweriwe Love',
    re: /iweriwe/,
    cands: [
      { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down', a: 'Rema' },
      { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
      { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
      { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
    ],
  },
  {
    name: 'Loyal Chella',
    re: /loyal.*chella|chella.*loyal/,
    cands: [
      { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
      { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
      { g: 'afrobeat', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
      { g: 'afrobeat', id: 'WTJSt4wP2ME', title: "Wavin' Flag", a: "K'NAAN" },
    ],
  },
];

(async () => {
  const add = [];
  for (const slot of slots) {
    if (has(slot.re)) {
      console.log('have', slot.name);
      continue;
    }
    let picked = null;
    for (const c of slot.cands) {
      if (!c.id || seen.has(c.id)) continue;
      const meta = await oembed(c.id);
      if (!meta) {
        console.log('bad', c.id, c.title);
        continue;
      }
      picked = { ...c, otitle: meta.title };
      break;
    }
    if (!picked) {
      console.log('FAIL', slot.name);
      continue;
    }
    seen.add(picked.id);
    add.push(picked);
    console.log('+', slot.name, '→', picked.title, picked.id, '|', picked.otitle);
  }

  console.log('adding', add.length);
  if (!add.length) {
    console.log('nothing new');
    return;
  }
  const block =
    '  /* —— User list pass 3 —— */\n' +
    add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
    '\n';
  if (!s.includes('];\n\nconst ALL =')) {
    console.error('anchor missing');
    process.exit(1);
  }
  s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('done unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
