/* Object Oriented Programming a style of programming centered around object rather than function */

/* Encapsulation: group and package related variables and functions inside an object */

let val; 
val = add(x, y); 
// console.log(val);

// OOP
const calculate = {
    x: 10, // variable inside an object is called a property/properties
    y: 15,
    add: function(){ // add method (function inside an object is called a method 
        return this.x + this.y; // the 'this' is pointing directly to the object property x or y that's being referenced;
    },
};

val = calculate.add();
console.log(val);
