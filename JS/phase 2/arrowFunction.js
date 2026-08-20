/* Arrow function:
 */

//console.log(x);
//var x = 5

// exercise

// The task. Write a function called validateUsername that checks a username and returns a message. The rules:

// If the username is empty, return "Username is required".
// If the username is shorter than 3 characters, return "Username too short".
// Otherwise, return "Username looks good".

const validateUsername = function (username) {
  if (username === "" || username === undefined) {
    return "Username is required";
  } else if (username.length < 3) {
    return "Username too short";
  } else {
    return "Username looks good";
  }
};

console.log(validateUsername("Ben"));

// another faster way with arrow function
// const validateUsername1 = (username) =>
//   username === "" || username === undefined
//     ? "Username is required"
//     : username.length <= 3
//       ? "Username too short"
//       : "Username looks good";
// console.log(validateUsername1("Moses"));

// back to arrow function:

const person = {
  firstName: "sam",
  lastName: "Williams",
  personWalk: function () {
    console.log("Sam can walk");
  },

  personRun: function () {
    const run = () => {
      console.log(`${this.firstName} can run very fast`);
    };
    run();
  },
};

person.personRun();
person.personWalk();


const cat = {
  name: "whisky",
  sayHi: () => {
    console.log(`Hi, ${this.name}`);
  },
};

cat.sayHi();


const dog = {
  name: "barry",
  sayHi: function(){
    console.log(`Hi, ${this.name}`);
  },
};

dog.sayHi();


// closure refresh
function closure(){
  const num = 10;
  console.log("I'm their parent")
  return function(){
    const myNum = 3;
    console.log("This is mine personal number", myNum)
    console.log(`I remember this number: "${num}" from my parent`)
  }
}

closure(); // output only variable associated with the parent
const myFunc = closure(); // remembers the parent values and itself
myFunc()