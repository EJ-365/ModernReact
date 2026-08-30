/* destructuring an array or object is a quicker way of getting
an object or an array values 
Destructuring lets you pull multiple values out in one line, matching by property name.
*/


// destructing an object

const items = {
    name: "apple", 
    price: 3, 
    color: "green",
    date: new Date().toString()
}
console.log(items.date);


// to destructure this object above:
const name1 = items.name;
const price1 = items.price;

// instead of this;
console.log(name1)
console.log(price1)

// you could do this: it allows you to pull out multiple values in one line
const {name, price,color, date} = items;
console.log(name);


// Array destructuring works the same way
const colors = ["red", "green", "blue"];
console.log(colors[1]);

// with destructuring
const [first, second, third] = colors;
console.log(first);
console.log(second);

// note that; before you can do destructuring you have to have ur array or object created;

/* spread operator 
Spread takes all the items out of an array or object and lays them out individually, most commonly used to copy or combine.

tips: taking items out individually like spreading or expanding things
*/

const nums1 = [1,2,3];
const nums2 = [...nums1, 4,5]; // combining nums1 with nums2
console.log(nums2); // combined from nums1 it becomes a brand new array
console.log(nums1);

// spread with object;
const item = {name: "apple", price: 3};
// with spread
const updated = {...item, price: 5}; // price is overwritten


// Rest ... similar to spread but it does the opposite
//  Spread expands things out. Rest gathers loose things up (packed loose things) into one array.
// tips: spread is to unpacked and combine why rest is to pack items and turn them into an array

function total(...prices){
    console.log(prices)
}

total(1,2,3,4,5); /* rest pack loose values and turn them into an array useful 
to get all the argument  */

// another example
function addAll(...nums){
    return nums.reduce((acc, n) => acc + n, 0 );
}

console.log(addAll(1,2,3,4,5))