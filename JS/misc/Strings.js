const name = "Alice";
const greetings = "Hello";
const template = `Hi ${name}`;
// console.log(template)

/* Strings are immutable */

const uppercase = name.toUpperCase();
// console.log(uppercase)

// searching with Strings
const str = "Hello Ejay";
console.log(str.includes("Ejay"));
console.log(str.startsWith("Hello"));
console.log(str.endsWith("Ejay"));
console.log(str.indexOf("Ejay"));
console.log(str.lastIndexOf("y"));

// character accessed
console.log(str.charAt(8));
console.log(str[8]);
console.log(str.at(-1));

// extracting a string
const str2 = "goodnight Ejay";
console.log(str2.slice(0, 9));
console.log(str2.slice(0));
console.log(str2.slice());

// with negative index
const str3 = "Hello World";
//  console.log(str3.slice(-5));

// padding:
const text = "hello";
const padded = text.padEnd(3, "...");
//  console.log(padded) // hello...

// repeating
const letterRepeat = "ha";
const repeated = letterRepeat.repeat(3);
//  console.log(repeated)

const myName = "Myy name is Ejayy";
const fixMyName = myName.replace("Myy", "My");
console.log(fixMyName);

// capitalizing first letter
const target = "john";
const capitalize = target.charAt(0).toUpperCase() + target.slice(1);
console.log(capitalize);

// recursion: a function that calls it self multiple times until a condition is met/reached

const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};

console.log(factorial(4));

/* visualizing 
 factorial(4) => fact(4) => 
 4 <= 1 => false:
 4 * fact(4-1) ==>  4 * fact(3); contd again
 3 * fact(3-1) ==>  3 * fact(2); contd again
 2 * fact(2-1) ==>  2 * fact(1); contd again
 1 <= 1 => true ==> 1

 now multiply everything starting from 4 -> 1
 4 * 3 * 2 * 1 = 24
 */

// another example

const checking = function check(n) {
  return n === 4 ? 2 : 2 * check(n + 1);
};
console.log(checking(3));

/*
start: n = 3
3 !== 4; false

else:

2 * check(3 + 1) ==> 2 * check(4);
4 === 4; true ;

returns 2: 
so it becomes: 2 * 2 = 4

*/