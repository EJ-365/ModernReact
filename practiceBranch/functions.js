/* function review */
function sayHello(name){
    return `Hello ${name}`
} 
// console.log(sayHello('Ejay'));

const sayHi = function(name = 'EJ'){
    return 'Hi ' + name;
}

// console.log(sayHi());

// IIFE = immediately invoked function expression 
;(function(name = "john doe") {
    console.log('Your name is ' + name);
})('Ej');
