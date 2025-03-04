let favFood = ['rice','beans','fufu','pizza','spaghetti'];
let formerFavoriteFood =  favFood.shift();
favFood.unshift('Chick-fill-A');
favFood.push('Whataburger');
// console.log(favFood);

const arr = [];
arr.pop();
// console.log(arr); // returns an empty array when i use the pop method it

/* [2, 3, 4, 5] -> [2, 4, 5] */
const numbers = [2, 3, 4, 5];
numbers.splice(1,1);
// console.log(numbers);

/*
In the examples below, use splice to 
convert the first array to the second array:*/

/*  
["alpha", "gamma", "delta"] -> ["alpha", "beta", "gamma", "delta"]
*/
const names = ['alpha', 'gamma', 'delta'];
names.splice(0,1,'alpha','beta');
// console.log(names);


/* 
[10,-10,-5,-3,2,1] -> [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
*/
const num = [10,-10,-5,-3,2,1];
num.splice(1,3,9,8,7,6,5,4,3);
console.log(num);