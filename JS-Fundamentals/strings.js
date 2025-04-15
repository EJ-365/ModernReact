/* All about strings in Javascript */

const myName = "Ejayz is a Software engineer"
const value = myName.indexOf('a', 1);
// console.log(value);

let message = "Hello Ejay";
const lastTerm = message.lastIndexOf("Ejay");

console.log(message.substring(0,5));

// console.log(`The last index of Ejay is ${lastTerm}`);

// const sleep = "I need to get some sleep before i can continue learning brb";
// console.log(sleep.toUpperCase());

const firstName = 'Ejay';
const lastName = 'Gabriel';

const result = firstName.concat(" " + lastName);
console.log(`My name is ${result}`);