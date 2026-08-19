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
const validateUsername1 = (username) =>
  username === "" || username === undefined
    ? "Username is required"
    : username.length <= 3
      ? "Username too short"
      : "Username looks good";
// console.log(validateUsername1("Moses"));
