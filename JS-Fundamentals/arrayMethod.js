// const days = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
// days.forEach(function(day, index){
// console.log(`Day ${index + 1} = ${day}`);
// })

// Map(); method with arrow function
// const numbers = [1,2,3,4,5];
// const print = numbers.map(x => x * 2);
// console.log(print);

// without arrow method
const numbers = [1,2,3,4,5];
const print = numbers.map(function(num){
    return num * 2;
});
// console.log(print);

// filter array method;
/* return an array of those element that passes the test */
// const ages = [16,18,14,34,33,12]
// const ageCheck = ages.filter(x => x >= 18);
// console.log(ageCheck);

const ages = [16,18,14,34,33,12];
const result = ages.filter(function(age){
    return age >= 18;
})

console.log(result);

// boh of them is the samething just that one is arrow function










// const num = [1,2,4,6,8];
// let result = num.indexOf(4);
// console.log(result);  // 2;  search for the index 4 and return the position where 4 is
