/* Testing Git detection */
/* date and time in javascript */ 
// date object in js
// const date = new Date();
// console.log(date);

let birthDay = new Date('December 9 2002');
// console.log(birthDay.toDateString());
// console.log(birthDay.getDate());

// date method

// get the year value
const today = new Date();
let year = today.getFullYear();
console.log('Year:' + year); // 2025

// get the month value
let month = today.getMonth();
console.log('Month:' + month); // 3; because month starts from 0 - 11

// get the date 
let date = today.getDate();
console.log('Date:' + date); // 17

// get the day
let day = today.getDay();
console.log('day:' + day); // 4; return day in months

// get hours
let hours = today.getHours();
console.log('Hours: ' + hours);

// get minutes
let minutes = today.getMinutes();
console.log('Minutes: ' + minutes);

// get seconds
let seconds = today.getSeconds();
console.log('Seconds: ' + seconds);

// get milliseconds
let milliseconds = today.getMilliseconds();
console.log('Milliseconds: ' + milliseconds);

// get time
let time = today.getTime();
console.log('Time:' + time);