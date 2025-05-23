/* Strict Mode: A feature in JavaScript that enforces stricter parsing and error handling, 
helps catch common coding mistakes, prevents the use of certain error-prone features, 
and makes code optimization easier for JavaScript engines. */

"use strict";  // uncomment it out to use strict mode it forces an error when things are wrong
//  x = 5;
// console.log(x);  // shows an error x is not define

/* const x = 5;
console.log(x); */ // 5  (good practice)

function add(a, b) {
    return a + b;
}
console.log(add(7,4));