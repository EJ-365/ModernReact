// function add(a,b){
//     return a + b;
// }
// const result = add(2,2);
// console.log(result);


function add(funcTwo ,b){
    return display() + b;
}

function display(){
    return 2;
}

const print = add(display, 5)
console.log(print);


/* Note: they are two ways you can achieve that, one of the callback has a parenthesis
and the other doesn't have, for example

const print = add(display(), 5) it has a parenthesis, the callback => display():
 because it wasn't called inside the main function
which is the add(); with the param funcTwo, b

another one doesn't have a parenthesis
const print = add(display, 5) it doesn't have a parenthesis: because it was called/return 
inside the main func i.e add, so you don't need a parenthesis when you call the main func
and passes an argument like this add(display, 5)

the first example above doesn't have a parenthesis for the callback function
here's another example below that has a parenthesis for the callback function
*/

function multiply(x,y) {
    return x * y;
    /* you can call/return the firstNum() here, so you won't have a parenthesis when
     you pass argument in the main function. 
     uncomment the code below  to see it and comment out the first return x * y         
     */

    //  return firstNum() * y;
}

// callback function
function firstNum() {
    return 5;
}

// calling the main function(the multiply() function)
const value = multiply(firstNum(), 4) // output: 20 (cause it returns 5 an multiply it by 4)
console.log(value);



// recommend the fist function(without a parenthesis) callback method, useful for async

/*  callback: when you pass in a function as an argument inside another function 
OR a function that takes in another function as an argument is known as a callback
*/