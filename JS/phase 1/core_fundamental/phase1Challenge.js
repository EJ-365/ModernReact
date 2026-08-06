/* 
Tiny Coding Challenge:

1. Write a function where var and let behave differently in a loop.
2. Predict the output of this code
console.log(a);
var a = 5;
console.log(a);

*/

// solution 

function varLoop(){
    var sum = 0;
    for(var i = 0; i < 3; i++){
       sum+= i;
       console.log(i)
    }
    console.log(i); // accessible globally
    
}
varLoop();

/* returns the last iteration which is 3: i is accessible 
all over the function same for the sum variable it's also accessible
all over the function
*/


// let scope
function letLoop(){
    let double = 1;
    for (let i = 1; i < 3; i++){
        double *= i;
        console.log(i)
    }
    console.log(double);
    // console.log(i); // TypeError:  i is not defined
}
letLoop()

// predicting the output of this code
// console.log(a);
// var a = 5; // a is not defined yet: which is refers to as hoisting
// console.log(a); // is equal to 5


// let see the result 
console.log(a);
var a = 5;
console.log(a);

// yayyy i got it right

// note that if it's var it's undefined and if it's let it say can't be access before initialization


/* 
Frontend Interview Question:

"What’s the difference between let and var in terms of scope?"
"Explain hoisting with an example."

*/


/* Answers:
1. In terms of scope the difference between let and var is 
let; is block scoped and it's only accessible in the block statement
where it's been created and var is a global scope and it's accessible
globally everywhere on the app/ function.

2. Hoisting is when a variable or a function is being called before the 
creation, which result to an undefined.

here is an example:

 console.log(a);
var a = 5;
console.log(a);

*/