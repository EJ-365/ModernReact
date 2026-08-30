const nums = [2, 4, 6];
const total = nums.reduce((acc, currVal) => acc + currVal, 10);
console.log(total);

// counting how many times a value appears in an array;
const letters = ["a", "b", "a", "c", "b", "a"];
const result = letters.reduce((acc, letter) => {
  if (acc[letter]) {
    acc[letter] += 1; // acc[letter] = acc[letter] + 1
  } else {
    acc[letter] = 1;
  }
  return acc;
}, {});

console.log(result)

const acc = {
  a: "miko",
  b: 50,
  c: "red",
};
console.log(acc["b"]);