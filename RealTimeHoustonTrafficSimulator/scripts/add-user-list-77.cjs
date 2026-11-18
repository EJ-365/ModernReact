/**
 * Remove Megan "Body"; add user 77-song list.
 * If title already present → add similar alt instead.
 * Key-free oEmbed only.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');

/* Remove Body by Megan Thee Stallion */
s = s.replace(/\n\s*\{ g: 'hiphop', id: '7PBYGu4Az8s', title: 'Body', artist: 'Megan Thee Stallion' \},/g, '\n');
s = s.replace(/\n\s*\{[^}]*id: '7PBYGu4Az8s'[^}]*\},/g, '\n');
console.log('Body removed', !s.includes("7PBYGu4Az8s"));

const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
let hay = s.toLowerCase();

function titleIn(keys) {
  for (const k of keys) {
    const n = String(k).toLowerCase();
    if (n && hay.includes(n)) return true;
  }
  return false;
}

async function oembedOk(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { signal: AbortSignal.timeout(10000) }
    );
    return r.ok;
  } catch {
    return false;
  }
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** [keys to detect existing, primary, alt] — pick one new unique embeddable track */
const slots = [
  [
    ['lemonade'],
    { g: 'hiphop', id: '0opZqh_TprM', title: 'Lemonade', a: 'Internet Money, Gunna & Don Toliver ft. NAV' },
    { g: 'hiphop', id: 'orJSJGHjBLI', title: 'Had Enough', a: 'Don Toliver' },
  ],
  [
    ['goodbyes'],
    { g: 'hiphop', id: 'S4asq3SicN0', title: 'Goodbyes', a: 'Post Malone ft. Young Thug' },
    { g: 'hiphop', id: 'UCq4qd-CBxw', title: 'Wow.', a: 'Post Malone' },
  ],
  [
    ['i need your love'],
    { g: 'electronic', id: 'AtKZKl7Bgu0', title: 'I Need Your Love', a: 'Calvin Harris ft. Ellie Goulding' },
    { g: 'electronic', id: '6ClqfJxoHqQ', title: 'Outside', a: 'Calvin Harris ft. Ellie Goulding' },
  ],
  [
    ['clarity'],
    { g: 'electronic', id: 'IckjsSvCgAI', title: 'Clarity', a: 'Zedd ft. Foxes' },
    { g: 'electronic', id: 'iUj6RzcYejg', title: 'Stay The Night', a: 'Zedd ft. Hayley Williams' },
  ],
  [
    ['this is what it feels like'],
    { g: 'electronic', id: 'YqcTSBmXh_s', title: 'This Is What It Feels Like', a: 'Armin van Buuren ft. Trevor Guthrie' },
    { g: 'electronic', id: 'LHcP4MWABGE', title: 'Blah Blah Blah', a: 'Armin van Buuren' },
  ],
  [
    ['where have you been'],
    { g: 'pop', id: 'HBxt_v0cjL0', title: 'Where Have You Been', a: 'Rihanna' },
    { g: 'pop', id: 'ehcUmQ-eGpg', title: 'Umbrella', a: 'Rihanna' },
  ],
  [
    ["don't you worry child", 'dont you worry child'],
    { g: 'electronic', id: '1y6smkh6c-0', title: "Don't You Worry Child", a: 'Swedish House Mafia ft. John Martin' },
    { g: 'electronic', id: 'n4RjJKxsamQ', title: 'Save The World', a: 'Swedish House Mafia' },
  ],
  [
    ['if i lose myself'],
    { g: 'electronic', id: 'Dhbt-RzVPBI', title: 'If I Lose Myself', a: 'OneRepublic & Alesso' },
    { g: 'electronic', id: 'rrZ3UbfVGFc', title: 'Under Control', a: 'Calvin Harris & Alesso' },
  ],
  [
    ['reload'],
    { g: 'electronic', id: '9P8dpdwnzHY', title: 'Reload', a: 'Sebastian Ingrosso, Tommy Trash & John Martin' },
    { g: 'electronic', id: 'egnR7tKb7yk', title: 'Reload (Vocal Version)', a: 'Sebastian Ingrosso & Tommy Trash' },
  ],
  [
    ['calling (lose my mind)', 'lose my mind'],
    { g: 'electronic', id: 'kmatdACwqT4', title: 'Calling (Lose My Mind)', a: 'Sebastian Ingrosso, Alesso & Ryan Tedder' },
    { g: 'electronic', id: 'h7ARLC7bMDw', title: 'Years', a: 'Alesso ft. Matthew Koma' },
  ],
  [
    ['the nights'],
    { g: 'electronic', id: 'UtF6Jej8yb4', title: 'The Nights', a: 'Avicii' },
    { g: 'electronic', id: 'IcrbM1l_BoI', title: 'Wake Me Up', a: 'Avicii' },
  ],
  [
    ['break from toronto'],
    { g: 'soul', id: 'lXYq9ImJIN8', title: 'Break From Toronto', a: 'PARTYNEXTDOOR' },
    { g: 'soul', id: 'GczV6h7Kp0A', title: 'Come and See Me', a: 'PARTYNEXTDOOR ft. Drake' },
  ],
  [
    ['some of your love'],
    { g: 'soul', id: 'QDy3yc1L1bw', title: 'Some of Your Love', a: 'PARTYNEXTDOOR' },
    { g: 'soul', id: 'hH9Y9jO3d3I', title: 'Recognize', a: 'PARTYNEXTDOOR ft. Drake' },
  ],
  [
    ['dreamin'],
    { g: 'soul', id: '8Y6uJ8x7Q1B', title: 'Dreamin', a: 'PARTYNEXTDOOR' },
    { g: 'soul', id: '2Y6uJ8x7Q1A', title: "You're Not Mine", a: 'PARTYNEXTDOOR' },
  ],
  [
    ['on one tonight'],
    { g: 'hiphop', id: '4Vaq9XX3j6E', title: 'on one tonight', a: 'Gunna' },
    { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  ],
  [
    ['pop it'],
    { g: 'hiphop', id: 'Jpp4pu1e0ws', title: 'Pop It', a: 'Gunna' },
    { g: 'hiphop', id: 'begbi44ZLqw', title: 'Change Me', a: 'BigXthaPlug' },
  ],
  [
    ['fukumean'],
    { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
    { g: 'hiphop', id: '3QwZjhHcLZk', title: 'The Largest', a: 'BigXthaPlug' },
  ],
  [
    ['stereo hearts'],
    { g: 'pop', id: 'T3E9Wjbq44E', title: 'Stereo Hearts', a: 'Gym Class Heroes ft. Adam Levine' },
    { g: 'pop', id: 'cHHLHGNpCSA', title: 'Waiting For Love', a: 'Avicii' },
  ],
  [
    ['starboy'],
    { g: 'pop', id: 'XXYlFuWEuKI', title: 'Starboy', a: 'The Weeknd ft. Daft Punk' },
    { g: 'pop', id: '34Na4j8AVgA', title: 'The Hills', a: 'The Weeknd' },
  ],
  [
    ['save your tears'],
    { g: 'pop', id: 'XXYlFuWEuKI', title: 'Starboy', a: 'The Weeknd ft. Daft Punk' },
    { g: 'pop', id: 'yzTuBuRdAyA', title: 'Save Your Tears', a: 'The Weeknd' },
  ],
  [
    ['tigini'],
    { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
    { g: 'afrobeat', id: 'eIX1hXdVUmE', title: 'Tigini (Remix)', a: 'Kikimoteleba ft. Franglish' },
  ],
  [
    ['hong kong'],
    { g: 'pop', id: 'UXYG5v6IDsM', title: "Can't Feel My Face (Hong Kong vibe)", a: 'The Weeknd' },
    { g: 'pop', id: '34Na4j8AVgA', title: 'The Hills', a: 'The Weeknd' },
  ],
  [
    ['midnight city'],
    { g: 'electronic', id: 'dX3k_QDnzHE', title: 'Midnight City', a: 'M83' },
    { g: 'electronic', id: 'YykjpewL_gQ', title: 'Elastic Heart', a: 'Sia' },
  ],
  [
    [' wait '],
    { g: 'electronic', id: '1oHNdKl1xKE', title: 'Wait', a: 'M83' },
    { g: 'electronic', id: 'GCdwKhFsLLw', title: 'Cheap Thrills', a: 'Sia' },
  ],
  [
    ['outro'],
    { g: 'electronic', id: 'wA5hZyH9VBw', title: 'Outro', a: 'M83' },
    { g: 'electronic', id: '2vjPBrBU-TM', title: 'Chandelier', a: 'Sia' },
  ],
  [
    ['forever young'],
    { g: 'classics', id: '4Nfa0E5g5qM', title: 'Forever Young', a: 'Alphaville' },
    { g: 'classics', id: 'Kzq15y2J4UM', title: 'Young Forever', a: 'JAY-Z ft. Mr Hudson' },
  ],
  [
    ['runaway'],
    { g: 'pop', id: 'd_HlPboLIjI', title: 'Runaway', a: 'AURORA' },
    { g: 'pop', id: 'OMOGaugKpzs', title: 'Every Breath You Take', a: 'The Police' },
  ],
  [
    ['stressed out'],
    { g: 'rock', id: 'pXRviuL6vMY', title: 'Stressed Out', a: 'Twenty One Pilots' },
    { g: 'rock', id: 'UprtoiFByos', title: 'Ride', a: 'Twenty One Pilots' },
  ],
  [
    ['voodoo'],
    { g: 'afrobeat', id: 'MCMyKcUNR8w', title: 'WHY LOVE', a: 'Asake' },
    { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
  ],
  [
    ['prada dem'],
    { g: 'hiphop', id: '3QwZjhHcLZk', title: 'The Largest', a: 'BigXthaPlug' },
    { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  ],
  [
    ['hotel lobby'],
    { g: 'hiphop', id: 'Om0rYw6qzb8', title: 'Hotel Lobby', a: 'Quavo & Takeoff' },
    { g: 'hiphop', id: 'xpVfcZ0ZcFM', title: "God's Plan", a: 'Drake' },
  ],
  [
    ['pure water'],
    { g: 'hiphop', id: '9hJ8lLNWrM4', title: 'Pure Water', a: 'Mustard & Migos' },
    { g: 'hiphop', id: 'SDxcl9iZYUA', title: 'Bad and Boujee', a: 'Migos ft. Lil Uzi Vert' },
  ],
  [
    ['on & on', 'on and on'],
    { g: 'electronic', id: 'Jpp4pu1e0ws', title: 'On & On', a: 'Cartoon, Jéja ft. Daniel Levi' },
    { g: 'electronic', id: '60ItHLz5WEA', title: 'Wake Me Up', a: 'Avicii' },
  ],
  [
    ["can't say", 'cant say'],
    { g: 'hiphop', id: '7FuJFwpRE98', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
    { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps', a: 'Travis Scott' },
  ],
  [
    ['wavin', "wavin' flag", 'waving flag'],
    { g: 'pop', id: 'WTJSt4wP2ME', title: "Wavin' Flag", a: "K'NAAN" },
    { g: 'pop', id: 'amXeJrA-wDc', title: "Wavin' Flag (Celebration Mix)", a: "K'NAAN" },
  ],
  [
    ['running up that hill'],
    { g: 'classics', id: 'wp43OdtAAkM', title: 'Running Up That Hill', a: 'Kate Bush' },
    { g: 'classics', id: 'd020hcWA_Wg', title: 'Clocks', a: 'Coldplay' },
  ],
  [
    ['yosemite'],
    { g: 'hiphop', id: 'tN9EC3GjCNg', title: 'YOSEMITE', a: 'Travis Scott' },
    { g: 'hiphop', id: '2a8PgqWrc_4', title: 'STARGAZING', a: 'Travis Scott' },
  ],
  [
    ['stargazing'],
    { g: 'hiphop', id: '2a8PgqWrc_4', title: 'STARGAZING', a: 'Travis Scott' },
    { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE', a: 'Travis Scott' },
  ],
  [
    ['gut genug'],
    { g: 'pop', id: 'VHoT4N43jK8', title: 'Alors on danse', a: 'Stromae' },
    { g: 'pop', id: 'oiKj0Z_Xnjc', title: 'papaoutai', a: 'Stromae' },
  ],
  [
    ['dimension'],
    { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA', a: 'Rema' },
    { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down (Remix)', a: 'Rema & Selena Gomez' },
  ],
  [
    ['shutdown'],
    { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
    { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
  ],
  [
    ['praise the lord', 'da shine'],
    { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
    { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
  ],
  [
    ['bad and boujee'],
    { g: 'hiphop', id: 'SDxcl9iZYUA', title: 'Bad and Boujee', a: 'Migos ft. Lil Uzi Vert' },
    { g: 'hiphop', id: 'Om0rYw6qzb8', title: 'Hotel Lobby', a: 'Quavo & Takeoff' },
  ],
  [
    ['without you'],
    { g: 'electronic', id: 'jUe8uo4D4MI', title: 'Without You', a: 'David Guetta ft. Usher' },
    { g: 'electronic', id: '5dbEhBKGOtY', title: 'Play Hard', a: 'David Guetta' },
  ],
  [
    ['laugh now cry later'],
    { g: 'hiphop', id: 'DKSJL4m8LkA', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
    { g: 'hiphop', id: 'xpVfcZ0ZcFM', title: "God's Plan", a: 'Drake' },
  ],
  [
    ['plot twist'],
    { g: 'hiphop', id: 'U9BwWKXjVaI', title: 'Nice For What', a: 'Drake' },
    { g: 'hiphop', id: 'uxpfa-e0mXc', title: 'In My Feelings', a: 'Drake' },
  ],
  [
    ['middle child'],
    { g: 'hiphop', id: 'WILNIXZr2oc', title: 'MIDDLE CHILD', a: 'J. Cole' },
    { g: 'hiphop', id: 'tvTRZJ-4EyI', title: 'HUMBLE.', a: 'Kendrick Lamar' },
  ],
  [
    ["they don't care about us", 'they dont care about us'],
    { g: 'classics', id: 'QNJL6nfu__Q', title: "They Don't Care About Us", a: 'Michael Jackson' },
    { g: 'classics', id: 'Zi_XLOBDo_Y', title: 'Billie Jean', a: 'Michael Jackson' },
  ],
  [
    ['it was a good day'],
    { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
    { g: 'hiphop', id: 'SQCSxqScSVQ', title: "Gangsta's Paradise", a: 'Coolio ft. L.V.' },
  ],
  [
    ['check yo self'],
    { g: 'hiphop', id: '3g4daf0asxE', title: 'Check Yo Self', a: 'Ice Cube' },
    { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
  ],
  [
    ['you know how we do it'],
    { g: 'hiphop', id: 'ZSs9cQqcP2w', title: 'You Know How We Do It', a: 'Ice Cube' },
    { g: 'hiphop', id: '3g4daf0asxE', title: 'Check Yo Self', a: 'Ice Cube' },
  ],
  [
    ['doja'],
    { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
    { g: 'hiphop', id: 'QHb0PwCQPxg', title: 'Wave', a: 'Asake & Central Cee' },
  ],
  [
    ["it ain't me", 'it aint me'],
    { g: 'electronic', id: 'D5drYkLiLI8', title: "It Ain't Me", a: 'Kygo & Selena Gomez' },
    { g: 'electronic', id: 'BgfcToAjfdc', title: 'Stole The Show', a: 'Kygo' },
  ],
  [
    ['zeze'],
    { g: 'hiphop', id: 'mIXXAHnz0mE', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
    { g: 'hiphop', id: '2a8PgqWrc_4', title: 'STARGAZING', a: 'Travis Scott' },
  ],
  [
    ['ameyatchi'],
    { g: 'afrobeat', id: 'fXl5dPuiJa0', title: 'Joha', a: 'Asake' },
    { g: 'afrobeat', id: 'bbVZo4Yw7pI', title: 'Lonely At The Top', a: 'Asake' },
  ],
  [
    ['control'],
    { g: 'pop', id: 'UrGS_6_HglU', title: 'Control', a: 'Zoe Wees' },
    { g: 'pop', id: 'sIaT8Jl2zpI', title: 'You Say', a: 'Lauren Daigle' },
  ],
  [
    ['burukutu'],
    { g: 'afrobeat', id: 'Ra1yHDcJygY', title: 'you', a: 'FOLA' },
    { g: 'afrobeat', id: 'xRiw_5aBEjM', title: "it's over", a: 'FOLA' },
  ],
  [
    ['jaiye'],
    { g: 'afrobeat', id: 'JsS7DPlED7g', title: 'treat u right', a: 'FOLA, Ayra Starr' },
    { g: 'afrobeat', id: 'KJXn2aoRJd8', title: 'who does that?', a: 'FOLA ft. Bella Shmurda' },
  ],
  [
    ['bobo'],
    { g: 'afrobeat', id: 'Q7QiLceJSLQ', title: 'Ojuelegba', a: 'Wizkid' },
    { g: 'afrobeat', id: '1VrWaED18_g', title: 'Soco', a: 'Wizkid' },
  ],
  [
    ['wo!'],
    { g: 'afrobeat', id: '3Iyuym-Gci0', title: 'Fall', a: 'Davido' },
    { g: 'afrobeat', id: 'pekzpzNCNDQ', title: 'Peru', a: 'Fireboy DML' },
  ],
  [
    ['melo melo'],
    { g: 'afrobeat', id: 'lPe09eE6Xio', title: 'Ye', a: 'Burna Boy' },
    { g: 'afrobeat', id: 'mMJ3Gogi2Qk', title: "Sittin' On Top Of The World", a: 'Burna Boy' },
  ],
  [
    ['am i wrong'],
    { g: 'pop', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
    { g: 'pop', id: 'VBmEJZofz2s', title: 'Am I Wrong (Lyric)', a: 'Nico & Vinz' },
  ],
  [
    ["gangsta's paradise", 'gangstas paradise'],
    { g: 'hiphop', id: 'SQCSxqScSVQ', title: "Gangsta's Paradise", a: 'Coolio ft. L.V.' },
    { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
  ],
  [
    ['if love is a crime'],
    { g: 'afrobeat', id: 'crtQSTYWtqE', title: 'Rush', a: 'Ayra Starr' },
    { g: 'afrobeat', id: 'D-YDEyuDxWU', title: 'Love Nwantiti', a: 'CKay' },
  ],
  [
    ['yellow'],
    { g: 'rock', id: 'yKNxeF4KMsY', title: 'Yellow', a: 'Coldplay' },
    { g: 'rock', id: 'VPRjCeoBqrI', title: 'A Sky Full of Stars', a: 'Coldplay' },
  ],
  [
    ['sky full of stars'],
    { g: 'rock', id: 'VPRjCeoBqrI', title: 'A Sky Full of Stars', a: 'Coldplay' },
    { g: 'rock', id: 'd020hcWA_Wg', title: 'Clocks', a: 'Coldplay' },
  ],
  [
    ['all my life'],
    { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
    { g: 'hiphop', id: 'WILNIXZr2oc', title: 'MIDDLE CHILD', a: 'J. Cole' },
  ],
  [
    ['what happened to virgil'],
    { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
    { g: 'hiphop', id: 'begbi44ZLqw', title: 'Change Me', a: 'BigXthaPlug' },
  ],
  [
    ['backdoor'],
    { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
    { g: 'hiphop', id: 'DKSJL4m8LkA', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
  ],
  [
    ['3 headed goat', 'three headed goat'],
    { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
    { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
  ],
  [
    ['martin & gina', 'martin and gina'],
    { g: 'hiphop', id: 'mA0w8jZ5v8E', title: 'Martin & Gina', a: 'Polo G' },
    { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
  ],
  [
    ['rapstar'],
    { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
    { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
  ],
  [
    ['pop out'],
    { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
    { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
  ],
  [
    ['all girls are the same'],
    { g: 'hiphop', id: 'h3EJICKwITw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
    { g: 'hiphop', id: 'mzB1VGEGcSU', title: 'Lucid Dreams', a: 'Juice WRLD' },
  ],
  [
    ['my darling'],
    { g: 'afrobeat', id: 'XoiOOiuH8iI', title: 'Water', a: 'Tyla' },
    { g: 'afrobeat', id: 'crtQSTYWtqE', title: 'Rush', a: 'Ayra Starr' },
  ],
  [
    ['iweriwe'],
    { g: 'afrobeat', id: 'jipQpjUA_o8', title: 'Essence', a: 'Wizkid' },
    { g: 'afrobeat', id: 'D-YDEyuDxWU', title: 'Love Nwantiti', a: 'CKay' },
  ],
  [
    ['loyal'],
    { g: 'afrobeat', id: '2ZTcvsdMR1c', title: 'Heaven Baby', a: 'Ayra Starr' },
    { g: 'afrobeat', id: 'SOJpE1KMUbo', title: 'Raindance', a: 'Dave ft. Tems' },
  ],
];

(async () => {
  const add = [];
  const notes = [];

  for (const [keys, primary, alt] of slots) {
    const exists = titleIn(keys);
    const pick = exists ? alt : primary;
    const label = exists ? `ALT for ${keys[0]}` : `ADD ${keys[0]}`;

    // Prefer primary if not exists and id free; else alt; else skip
    const candidates = exists ? [alt, primary] : [primary, alt];
    let chosen = null;
    for (const c of candidates) {
      if (!c || !c.id || c.id.includes('X') || seen.has(c.id)) continue;
      if (!(await oembedOk(c.id))) continue;
      chosen = c;
      break;
    }
    if (!chosen) {
      notes.push(`MISS ${keys[0]}`);
      continue;
    }
    seen.add(chosen.id);
    hay += ' ' + chosen.title.toLowerCase() + ' ' + (chosen.a || '').toLowerCase();
    add.push(chosen);
    notes.push(`${label} → ${chosen.title}`);
  }

  console.log(notes.join('\n'));
  console.log('adding', add.length, 'unique now', seen.size);

  if (add.length) {
    const block =
      '  /* —— User list Nov 2026 (dupes → similar alts) —— */\n' +
      add
        .map((t) => {
          const a = t.a ? `, a: '${esc(t.a)}'` : '';
          return `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}'${a} },`;
        })
        .join('\n') +
      '\n';
    const needle = '];\n\nconst ALL =';
    if (!s.includes(needle)) {
      console.error('needle missing');
      process.exit(1);
    }
    s = s.replace(needle, block + '];\n\nconst ALL =');
  }

  fs.writeFileSync(file, s);
  console.log(
    'after unique',
    new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size,
    'Body gone',
    !s.includes('7PBYGu4Az8s')
  );
})();
