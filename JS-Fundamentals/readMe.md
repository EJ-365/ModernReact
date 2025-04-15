# Difference Between `toFixed()` and `Math.round()`

- **`toFixed()`**: Formats a number to a specified number of decimal places and returns it as a string.
- **`Math.round()`**: Rounds a number to the nearest whole number and returns it as a number.

## Example

```javascript
const x = 2.7673;

console.log(x.toFixed(2)); // Output: "2.77" (string with 2 decimal places)
console.log(Math.round(x)); // Output: 3 (rounded to the nearest whole number)
