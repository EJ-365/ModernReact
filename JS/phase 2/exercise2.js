function createCart(){
    let items = [];
    return {
        addItem: (item) => {
              items.push(item);
             return items;
        },

        addItems: (...newItems) => {
            items = [...items, ...newItems];
            return items;
        },

        removeItem:(name) => {
            items = items.filter(item => item.name !== name )
            return items;
        },
        getExpensiveItems: (minPrice) => {
           return items.filter(min => min.price > minPrice );
           
        },
        getTotal: () => {
            return items.reduce((acc, currentVal) => acc + currentVal.price,0)
        }
    }
}

const cart = createCart();

console.log(cart.addItem({ name: "apple", price: 3 }));
console.log(cart.addItem({ name: "orange", price: 5 }));
console.log(cart.addItem({ name: "mango", price: 10 }));

console.log(cart.removeItem("mango"));

console.log(cart.addItems({ name: "banana", price: 2 }, { name: "grape", price: 4 }));

console.log(cart.getTotal());




// let items = [
//     {name: "apple", price: 3},
//     {name: "mango", price: 5},
//     {name: "orange", price:10},
//     {name: "watermelon", price: 6}
// ]

// items.push({name: "tangerine", price: 30})
// let remove = "mango";

// const removed = items.filter(value => value.name !== remove);
// console.log(removed)

// const sum = items.reduce((acc, currentVal) =>{
//   return acc + currentVal.price
// },0);
// console.log(sum)

// for (let i = 0; i < items.length; i++){
//     console.log(items[i].name)
// }


// misc: Functions As Values
function add(x,y){
    return x + y;
}

function mul(x,y){
    return x * y;
}

function aggregate(a,b,c, arithmetic){
const firstResult = arithmetic(a,b);
const secondResult = arithmetic(firstResult, c);
return secondResult;
}

function main(){
    const sum = aggregate(1,2,3, add);
    console.log(sum);

    const product = aggregate(1,2,3, mul);
    console.log(product)
}

main()