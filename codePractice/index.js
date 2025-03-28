/* 
Write a function addTo that accepts a number as a parameter and adds all natural numbers smaller 
or equal than the parameter. The result is to be returned.
Example: addTo(3) should return 1+2+3 = 6.
*/

// create the function 
function addTo(n) { 
    let sum = 0;
    for (let i = 0; i <= n; i++){
      sum += i;
    }
   return sum;
}
// console.log(addTo(5));

// factorial
 // 5! = 5*4*3*2*1 = 120;

 function factorial(n){
    let result = 1;
   for (let i = n; i > 0; i--){
    result *=i;
   }
   return result;
 }
console.log(factorial(4))