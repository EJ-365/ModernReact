/* arrow function and the setTimeout() and setInterval() functions */
/* arrow function enables us to write shorter function and without using the function 
keyword: it's simple and easy to use */


// const greet = function(){
//   console.log('Hello');
// }


const greet = () => console.log("Hello");
greet();

/**************************Previous Code**************************************** */
// for example
function addNum(x, y) {
  return x + y;
}

const result = addNum(4, 5);
// console.log(result);

// with arrow function
const addingNum = (x, y) => {
  return x + y;
};

const ans = addingNum(4, 2);
// console.log(ans);

// const sayHello = () => "hello everyone";

const square = (x) => {
  return x * x;
};
// console.log(square(3));

const rollDie = () => {
  return Math.floor(Math.random() * 16) + 5; // formula:(max-min + 1) + min
};
// console.log(rollDie());

/*
setTimeout() is a higher order function that takes in a callback function
 and a delay time
the syntax is:
setTimeout(callback, delay)
callback: is the function you want to execute
delay: is the time in millisecond before the callback function is executed
*/

// console.log("Hello EJ hold on for a sec"); // execute first
setTimeout(() => {
  // console.log("Ok let's continue");
}, 3000); // execute later
// console.log("Thanks for waiting"); // execute second

/* setInterval: setInterval(callback, delay): Repeatedly executes a 
provided callback function at a fixed time interval
 (specified by delay in milliseconds). Unlike setTimeout, 
 which runs only once, setInterval continues to run the callback 
 until you explicitly stop it using clearInterval.
 */

const id = setInterval(() => {
  console.log("Ejeme365"); // continue running Ejeme365
}, 3000);
clearInterval(id); // stop it from continuous running: right now it's not running unless you remove the clearInterval() function

/* in conclusion setTimeout() and setInterval() are the same but one thing is diff
setTimeout() runs only for the given delay and stop after in other words it runs once while
setInterval() continuous running until you assign it a variable and you can use that variable
to stop by passing it to the clearInterval(variable) function  just like that */
