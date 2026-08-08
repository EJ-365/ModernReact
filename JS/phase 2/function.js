/* functions: is a way we make our code more reusable and easier, we can call it anywhere 
we want in our code. They're few ways to declare a function 
*/

// 1. function declaration: which is the most commonly used.
function greet(){
    console.log("hi");
}

greet(); // called the function; and it will execute what it's inside


// function expression: another way of creating a function by assigning a variable reference to it
const greeting = function(){
    console.log("hello")
}

greeting()

//both of them do the same thing but different creation/written


/* Hoisting: A function can be hoisted depending on how it's being created for ex
function declaration can be hoisted: and hoisted means calling a function before initialization or creation.

function expression can't be hoisted else we will have Cannot access 'func name' before initialization; because we are trying to call a function that hasn't be created yet and remember code runs from top to bottom*/

// example of hoisting:

// with function declaration 

afternoon("John"); // Good afternoon John: this function call is hoisted

function afternoon(user){
    console.log("Good afternoon", user)
}


// with function expression:
evening("mike"); // Error

const evening = function(user){
    console.log("Good evening", user);
}