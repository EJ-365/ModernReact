const fs = require('fs');
const s = fs.readFileSync(require('path').join(__dirname, '..', 'src', 'tour-music.js'), 'utf8');
const low = s.toLowerCase();
const checks = [
  ['Lemonade', /lemonade.*gunna|internet money.*lemonade|0opzqh_tprm/i],
  ['Goodbyes', /goodbyes/i],
  ['I Need Your Love', /i need your love/i],
  ['Clarity', /clarity/i],
  ['This Is What It Feels Like', /this is what it feels like/i],
  ['Where Have You Been', /where have you been/i],
  ["Don't You Worry Child", /don't you worry child|dont you worry child|save the world/i],
  ['If I Lose Myself', /if i lose myself/i],
  ['Reload', /title: 'Reload'/i],
  ['Calling', /calling \(lose my mind\)/i],
  ['The Nights', /the nights/i],
  ['Break From Toronto', /break from toronto/i],
  ['Some of Your Love', /some of your love/i],
  ['Dreamin', /dreamin/i],
  ['on one tonight', /on one tonight/i],
  ['Pop It', /title: 'Pop It'/i],
  ['fukumean', /fukumean/i],
  ['Stereo Hearts', /stereo hearts/i],
  ['Starboy', /starboy/i],
  ['Save Your Tears', /save your tears/i],
  ['Tigini', /tigini/i],
  ['Hong Kong / vibe', /hong kong|kiss land|wicked games \(hong|often \(hong|the morning \(hong|hills \(hong|blinding lights \(hong/i],
  ['Midnight City', /midnight city/i],
  ['Wait M83', /title: 'Wait'/i],
  ['Outro M83', /title: 'Outro'/i],
  ['Forever Young', /forever young/i],
  ['Runaway AURORA', /runaway.*aurora|aurora.*runaway|title: 'Runaway'/i],
  ['Stressed Out', /stressed out/i],
  ['Voodoo', /voodoo/i],
  ['prada dem', /prada dem/i],
  ['Hotel Lobby', /hotel lobby/i],
  ['Pure Water', /pure water/i],
  ['On & On', /on & on/i],
  ["CAN'T SAY", /can't say|cant say/i],
  ['Wavin Flag', /wavin/i],
  ['Running Up That Hill', /running up that hill/i],
  ['YOSEMITE', /yosemite/i],
  ['STARGAZING', /stargazing/i],
  ['Gut Genug', /gut genug/i],
  ['Dimension', /dimension/i],
  ['Shutdown', /shutdown/i],
  ['Praise The Lord', /praise the lord/i],
  ['Bad and Boujee', /bad and boujee/i],
  ['Without You Guetta', /without you/i],
  ['Laugh Now Cry Later', /laugh now cry later/i],
  ['Plot Twist', /plot twist/i],
  ['MIDDLE CHILD', /middle child/i],
  ["They Don't Care About Us", /they don\\?'?t care about us|they dont care about us/i],
  ['It Was a Good Day', /it was a good day|good day/i],
  ['Check Yo Self', /check yo self/i],
  ['You Know How We Do It', /you know how we do it/i],
  ['Doja', /title: 'Doja'/i],
  ["It Ain't Me", /it ain't me|it aint me|stole the show/i],
  ['ZEZE', /zeze/i],
  ['Ameyatchi', /ameyatchi/i],
  ['Control Zoe', /zoe wees/i],
  ['Burukutu', /burukutu/i],
  ['Jaiye / Motigbana', /\bjaiye\b|motigbana/i],
  ['Bobo', /title: 'Bobo'/i],
  ['Wo Olamide', /title: 'Wo!'/i],
  ['Melo Melo', /melo melo/i],
  ['Am I Wrong', /am i wrong/i],
  ["Gangsta's Paradise", /gangsta/i],
  ['If Love Is A Crime', /if love is a crime/i],
  ['Yellow', /title: 'Yellow'/i],
  ['A Sky Full of Stars', /sky full of stars/i],
  ['All My Life', /all my life/i],
  ['What Happened to Virgil', /what happened to virgil/i],
  ['Backdoor', /backdoor/i],
  ['3 Headed Goat', /3 headed goat/i],
  ['Martin & Gina', /martin & gina/i],
  ['RAPSTAR', /rapstar/i],
  ['Pop Out', /pop out/i],
  ['All Girls Are the Same', /all girls are the same/i],
  ['My Darling', /my darling/i],
  ['Iweriwe Love', /iweriwe/i],
  ['Loyal Chella', /title: 'Loyal'/i],
  ['Body Megan removed', /7pbygu4az8s/i],
];
let miss = 0;
for (const [n, re] of checks) {
  const ok = re.test(s) || re.test(low);
  const wantMiss = n === 'Body Megan removed';
  if (wantMiss) {
    console.log((!ok ? 'OK  ' : 'STILL') + ' ' + n + (!ok ? ' (gone)' : ' (STILL PRESENT)'));
    if (ok) miss++;
  } else {
    if (!ok) miss++;
    console.log((ok ? 'OK  ' : 'MISS') + ' ' + n);
  }
}
console.log('miss/problem count', miss);
console.log('unique ids', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
