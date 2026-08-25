/*
The build. Write a function createCart that returns an object with three methods.

addItem, adds 1 to a running total and returns the new total.
removeItem, subtracts 1 from the total, but never goes below 0, and returns the new total.
getTotal, just returns the current total without changing it.

The total itself must be private, closed over, not sitting on the object directly. Nothing outside should be able to do cart.total = 999 and cheat.
*/


function createCart(){
    let total = 0;
    return {
        addItem: () => {
           total++;
           return total;
        },

        removeItem: () => {
            if(total > 0){
                total--;
            }
            return total;
        },

        addMultiple: (n) => {
            total += n;
            return total;
        },

        getTotal: () => {
            return total;
        }
    }
}

const cart = createCart();
console.log(cart.addItem());
console.log(cart.addItem());
console.log(cart.removeItem());
console.log(cart.addMultiple(5));
console.log(cart.getTotal());

console.log(cart.getTotal())



// another closure example
function multiply(){
    const number = 2;
      console.log(number)
    return () => {
        return number * 4;
    }
}

const result = multiply();
// console.log(result())

// multiply()