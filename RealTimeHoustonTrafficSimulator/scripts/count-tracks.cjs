const fs=require("fs");
const t=fs.readFileSync("src/tour-music.js","utf8");
const m=t.match(/const TRACKS = \[([\s\S]*?)\];/);
const ids=new Set();
const re=/\{ id: "([^"]+)"/g;
let x;
while((x=re.exec(m[1]))) ids.add(x[1]);
console.log("unique", ids.size);
