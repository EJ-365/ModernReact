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
let result = food.splice(
  0,
  1,
  "Ejeme"
); /* first one is the index, second is how many you want 
to delete and the third one is replacement */
// console.log(food);

// let demo = document.querySelector(".demo");
// demo.innerHTML = `
// Arrays: ${food + " "}
// `;

let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
colors.forEach((x) => {
  // console.log(x);
});

// Yes, this code is correct. Here's why:
// 1. It correctly selects the container element using getElementById
// 2. It uses a proper for loop to create 100 buttons
// 3. It creates button elements using createElement
// 4. It adds text content using append()
// 5. It properly appends each button to the container
