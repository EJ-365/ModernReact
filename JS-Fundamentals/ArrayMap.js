/* The map() method creates a new array with the results of calling
 a provided function on every element in the array. It transforms each
  element and returns a new array of the same length.*/

let fruits = ["mango", "apple", "pawpaw", "orange"];
// let fruit = fruits.map(function (x) {
//   return x.length;
// });

// let fruit = fruits.map((x) => x.toUpperCase());
// console.log(fruit);

// fruits.forEach((item) => console.log(item));

const food = ["fufu", "rice", "eba", "noodle", "pasta"];
let result = food.splice(2, 1);

let demo = document.querySelector(".demo");
demo.innerHTML = `
Arrays: ${food + " "}
`;
