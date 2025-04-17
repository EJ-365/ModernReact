/* This code convert celsius to fahrenheit.
formula: (°C × 9/5) + 32 = 32°F  */
function convertTemp(celsius){
    return (celsius * 9/5) + 32;
}

// console.log(convertTemp(30));

// loops review 

const users =['user 1', 'user 2', 'user 3', 'user 4'];
// for (let i = 0; i < users.length; i++) {
//     console.log(users[i]);
// }

// for(let user of users) {
//     console.log(user);
// }

for(let i = 0; i < 10; i++){
    if(i === 5) {
        // console.log("i is 5");
        continue; // continue from 5 without writing the value 5 only the statement inside the if-else
        // break; // stop here; terminate the execution
    }
    // console.log(i);
}

// while loop
// let count = 0;
// while (count < 10) {
//     count++;
//     console.log(count);
// }

let j = 10;
do {
    console.log("This will print once, even though j is 10");
} while (j < 5);  // condition is checked after the first run
