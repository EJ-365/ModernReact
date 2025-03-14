/* Some()
 Similar to every, but returns a boolean (true or false) if ANY of t array elements pass the test function */
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const result = numbers.some((x) => x % 2 === 0);
console.log(result);

/* every() is opposite of some(); every() check if all of them passes the test or they
are correct. While 
some() checks if at least some of them is true not all at least some of them are correct*/
