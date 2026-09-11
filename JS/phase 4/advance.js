// inpure function: same input, different ouput that changes when called multiple times
let total = 0;
function addToTotal(n){
 return total += n;  // 0 = 0 + 3
}

console.log(addToTotal(3));
console.log(addToTotal(3))
console.log(addToTotal(3))


// pure function: same input gives different output
function double(n){
return n * 2;
}
console.log(double(3));
console.log(double(3));


/* Singleton, quick summary.

A design pattern, only one instance of something can ever exist, no matter how many times you try to create it.*/

let instance = null;
function createCart(){
    if(instance){
        return instance;
    }
    else {
        instance = {items: []};
        return instance;
    }
}

const cart1 = createCart();
const cart2 = createCart();
const cart3 = createCart();

// all three carts point to the same  object
