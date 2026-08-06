// variable scopes:
/* let, const, var, hoisting, block vs. function scope

var: is a global scope which means it can be access everywhere
let is a block scope it stays inside the block it was created at
const means constant, it cannot be redeclared when created you can change it context if it's an array/object

*/

// code snippet:


// var scope:
function exampleVar(){ 
    if(true){ // execute when it's true
        var x = 10; // global scope; accessible inside the function
    }
    console.log(x);
}

exampleVar(); // the output is 10;





// let scope
function exampleLet(){
    if(true){
     let y = 5;
    }
    console.log(y)
}

// exampleLet(); y is not defined

// const/constant example;
const PI = 3.144456664775;
PI = 3.2; // Error: Assignment to constant variable