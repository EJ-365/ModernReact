const myInfo = {
  name: "Ejay E. Gabriel",
  age: 22,
  favFood: "fufu",
  favSport: "soccer",
  quote: function () {
    return "It's what it's";
  },
};

// let demo = document.getElementById("demo");
// demo.innerHTML = `
//     <p>Name: ${myInfo.name}</p>
//     <p>Age: ${myInfo.age}</p>
//     <p>Fav food: ${myInfo.favFood}</p>
//      <p>quote: ${myInfo.quote()}</p>
// `;

// const user = {
//   name: "john doe",
//   age: 32,
//   height: 6.4,
//   eyeColor: "brown",
//   stomach: {
//     smallIntestine: true,
//     liver: true,
//     numOfCell: "billions",
//   },
//   movement: function () {
//     return "I can walk";
//   },
// };

// console.log(user.name);

// const dog = {
//   name: "Cooper",
//   age: 3,
//   bark: function () {
//     console.log("Woof woof");
//   },
// };

// use the new keyword

function UserInfo(name, age, occupation) {
  this.name = name;
  this.age = age;
  this.occupation = occupation;
}

const user1 = new UserInfo("EJ Gabriel", 22, "Student");
const user2 = new UserInfo("Sam Tommy", 22, "Student");

// let demo = document.querySelector("#demo");
// demo.innerHTML = `
// <p> Name: ${user1.name} </p>
// <p> Age: ${user1.age} </p>
// <p> Occupation: ${user1.occupation} </p>
// `;

// Array destructuring: destructuring unpack object and array into variables
let names = ["john", "smith"];
let [firstName, lastName] = names;
// console.log(firstName);

const person = {
  fname: "John",
  lname: "Doe",
  age: 35,
};

// destructuring it.
let { fname, lname, country = "US" } = person;
console.log(lname);

// arrow function: allows us to write shorter function syntax
// function sayHello(){
//   return "hello"
// }

// with arrow function
// sayHello = () => {
//   return "hello";
// };
/* more concise: you don't need the square bracket for 1 or no parameter and you don't
 need a return keyword */
//  sayHello = () => "hello "

// with parameter
// function add(a, b) {
//   return a + b;
// }

// with arrow function
let add = (a, b) => a + b; // you don't have to use the return keyword or a square bracket if you have one or 2 param
// console.log(add(3, 2));

// tbd
