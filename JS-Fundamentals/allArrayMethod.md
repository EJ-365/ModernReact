# JavaScript Array Methods Reference

## Transformation Methods

### `map()`

**Definition:** Creates a new array with the results of calling a provided function on every element.
**Returns:** New array
**Examples:**

```javascript
// Double each number
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8]

// Extract property from objects
const users = [{name: 'EJ', age: 21}, {name: 'Scott', age: 30}];
const names = users.map(user => user.name);
console.log(names); // ['EJ', 'Scott']
```

### `filter()`

**Definition:** Creates a new array with elements that pass the test implemented by the provided function.
**Returns:** New array
**Examples:**

```javascript
// Get even numbers
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// Filter high votes
const comments = [
    {username: 'EJ', text: 'Hello', vote: 100000},
    {username: 'scott', text: 'How are you', vote: 30}
];
const highVotes = comments.filter(comment => comment.vote > 50);
console.log(highVotes); // [{username: 'EJ', text: 'Hello', vote: 100000}]
```

### `slice()`

**Definition:** Returns a shallow copy of a portion of an array into a new array.
**Returns:** New array
**Examples:**

```javascript
// Get portion of array
const fruits = ['apple', 'banana', 'cherry', 'date'];
const someFruits = fruits.slice(1, 3);
console.log(someFruits); // ['banana', 'cherry']

// Copy array
const original = [1, 2, 3];
const copy = original.slice();
console.log(copy); // [1, 2, 3]
```

### `concat()`

**Definition:** Merges two or more arrays without changing the existing arrays.
**Returns:** New array
**Examples:**

```javascript
// Combine arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = arr1.concat(arr2);
console.log(combined); // [1, 2, 3, 4]

// Add elements
const numbers = [1, 2, 3];
const withMore = numbers.concat(4, 5, [6, 7]);
console.log(withMore); // [1, 2, 3, 4, 5, 6, 7]
```

## Reduction Methods

### `reduce()`

**Definition:** Executes a reducer function on each element, resulting in a single output value.
**Returns:** Single value (any type)
**Examples:**

```javascript
// Sum array
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'cherry', 'apple'];
const count = fruits.reduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1;
    return acc;
}, {});
console.log(count); // {apple: 3, banana: 1, cherry: 1}
```

### `find()`

**Definition:** Returns the first element that satisfies the provided testing function.
**Returns:** Element or undefined
**Examples:**

```javascript
// Find first even number
const numbers = [1, 3, 5, 8, 9];
const firstEven = numbers.find(num => num % 2 === 0);
console.log(firstEven); // 8

// Find user by name
const users = [{name: 'EJ'}, {name: 'Scott'}];
const scott = users.find(user => user.name === 'Scott');
console.log(scott); // {name: 'Scott'}
```

### `findIndex()`

**Definition:** Returns the index of the first element that satisfies the provided testing function.
**Returns:** Index (number) or -1
**Examples:**

```javascript
// Find index of first even number
const numbers = [1, 3, 5, 8, 9];
const index = numbers.findIndex(num => num % 2 === 0);
console.log(index); // 3

// Find index of user
const users = [{name: 'EJ'}, {name: 'Scott'}];
const scottIndex = users.findIndex(user => user.name === 'Scott');
console.log(scottIndex); // 1
```

### `join()`

**Definition:** Creates and returns a new string by concatenating all elements with a separator.
**Returns:** String
**Examples:**

```javascript
// Join with comma
const fruits = ['apple', 'banana', 'cherry'];
const csv = fruits.join(',');
console.log(csv); // 'apple,banana,cherry'

// Create sentence
const words = ['JavaScript', 'is', 'fun'];
const sentence = words.join(' ');
console.log(sentence); // 'JavaScript is fun'
```

## Testing Methods

### `some()`

**Definition:** Tests whether at least one element passes the test implemented by the provided function.
**Returns:** Boolean
**Examples:**

```javascript
// Check for even numbers
const numbers = [1, 2, 3, 4, 5];
const hasEven = numbers.some(num => num % 2 === 0);
console.log(hasEven); // true

// Check for specific value
const words = ['apple', 'banana', 'cherry'];
const containsCherry = words.some(word => word === 'cherry');
console.log(containsCherry); // true
```

### `every()`

**Definition:** Tests whether all elements pass the test implemented by the provided function.
**Returns:** Boolean
**Examples:**

```javascript
// Check if all numbers are even
const numbers = [2, 4, 6, 8];
const allEven = numbers.every(num => num % 2 === 0);
console.log(allEven); // true

// Check if all words contain 'a'
const words = ['apple', 'banana', 'cherry'];
const allContainA = words.every(word => word.includes('a'));
console.log(allContainA); // true
```

### `includes()`

**Definition:** Determines whether an array includes a certain value.
**Returns:** Boolean
**Examples:**

```javascript
// Check if array contains value
const numbers = [1, 2, 3, 4];
console.log(numbers.includes(3)); // true

// Check with starting index
const letters = ['a', 'b', 'c', 'd'];
console.log(letters.includes('b', 2)); // false
```

## Iteration Methods

### `forEach()`

**Definition:** Executes a provided function once for each array element.
**Returns:** undefined
**Examples:**

```javascript
// Log each element
const fruits = ['apple', 'banana', 'cherry'];
fruits.forEach(fruit => console.log(fruit));
// Logs: 'apple', 'banana', 'cherry'

// Modify external array
const numbers = [1, 2, 3];
const doubled = [];
numbers.forEach(num => doubled.push(num * 2));
console.log(doubled); // [2, 4, 6]
```

## Mutation Methods (Modify Original Array)

### `push()`

**Definition:** Adds one or more elements to the end of an array.
**Returns:** New length of the array
**Examples:**

```javascript
// Add elements to end
const fruits = ['apple', 'banana'];
const newLength = fruits.push('cherry', 'date');
console.log(fruits); // ['apple', 'banana', 'cherry', 'date']
console.log(newLength); // 4

// Add array elements
const numbers = [1, 2];
numbers.push(...[3, 4]);
console.log(numbers); // [1, 2, 3, 4]
```

### `pop()`

**Definition:** Removes the last element from an array.
**Returns:** The removed element
**Examples:**

```javascript
// Remove last element
const fruits = ['apple', 'banana', 'cherry'];
const removed = fruits.pop();
console.log(fruits); // ['apple', 'banana']
console.log(removed); // 'cherry'

// Empty array
const stack = [1, 2, 3];
while(stack.length > 0) {
    console.log(stack.pop());
}
// Logs: 3, 2, 1
```

### `shift()`

**Definition:** Removes the first element from an array.
**Returns:** The removed element
**Examples:**

```javascript
// Remove first element
const fruits = ['apple', 'banana', 'cherry'];
const first = fruits.shift();
console.log(fruits); // ['banana', 'cherry']
console.log(first); // 'apple'

// Process queue
const queue = [1, 2, 3];
while(queue.length > 0) {
    console.log(queue.shift());
}
// Logs: 1, 2, 3
```

### `unshift()`

**Definition:** Adds one or more elements to the beginning of an array.
**Returns:** New length of the array
**Examples:**

```javascript
// Add elements to beginning
const fruits = ['banana', 'cherry'];
const newLength = fruits.unshift('apple');
console.log(fruits); // ['apple', 'banana', 'cherry']
console.log(newLength); // 3

// Add multiple elements
const numbers = [3, 4];
numbers.unshift(1, 2);
console.log(numbers); // [1, 2, 3, 4]
```

### `splice()`

**Definition:** Changes array contents by removing/replacing elements.
**Returns:** Array of removed elements
**Examples:**

```javascript
// Remove elements
const fruits = ['apple', 'banana', 'cherry', 'date'];
const removed = fruits.splice(1, 2);
console.log(fruits); // ['apple', 'date']
console.log(removed); // ['banana', 'cherry']

// Replace elements
const numbers = [1, 2, 3, 4];
numbers.splice(1, 2, 'a', 'b');
console.log(numbers); // [1, 'a', 'b', 4]
```

### `sort()`

**Definition:** Sorts the elements of an array in place.
**Returns:** The sorted array (reference to original)
**Examples:**

```javascript
// Sort strings
const fruits = ['cherry', 'apple', 'banana'];
fruits.sort();
console.log(fruits); // ['apple', 'banana', 'cherry']

// Sort numbers
const numbers = [10, 5, 8, 1, 7];
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 5, 7, 8, 10]
```

### `reverse()`

**Definition:** Reverses the order of elements in an array in place.
**Returns:** The reversed array (reference to original)
**Examples:**

```javascript
// Reverse array
const numbers = [1, 2, 3, 4, 5];
numbers.reverse();
console.log(numbers); // [5, 4, 3, 2, 1]

// Reverse and chain
const fruits = ['apple', 'banana', 'cherry'];
const reversed = fruits.slice().reverse();
console.log(fruits); // ['apple', 'banana', 'cherry']
console.log(reversed); // ['cherry', 'banana', 'apple']
```

## Other Utility Methods

### `Array.from()`

**Definition:** Creates a new Array instance from an array-like or inerrable object.
**Returns:** New array
**Examples:**

```javascript
// Create array from string
const array = Array.from('hello');
console.log(array); // ['h', 'e', 'l', 'l', 'o']

// Create array with mapping function
const mapped = Array.from([1, 2, 3], x => x * 2);
console.log(mapped); // [2, 4, 6]
```

### `Array.isArray()`

**Definition:** Determines whether the passed value is an Array.
**Returns:** Boolean
**Examples:**

```javascript
// Check if array
console.log(Array.isArray([1, 2, 3])); // true

// Check non-arrays
console.log(Array.isArray('hello')); // false
console.log(Array.isArray({length: 5})); // false
```

### `indexOf()`

**Definition:** Returns the first index at which a given element can be found.
**Returns:** Index (number) or -1
**Examples:**

```javascript
// Find index of element
const fruits = ['apple', 'banana', 'cherry', 'banana'];
console.log(fruits.indexOf('banana')); // 1

// Find with starting index
console.log(fruits.indexOf('banana', 2)); // 3
```

### `lastIndexOf()`

**Definition:** Returns the last index at which a given element can be found.
**Returns:** Index (number) or -1
**Examples:**

```javascript
// Find last index of element
const fruits = ['apple', 'banana', 'cherry', 'banana'];
console.log(fruits.lastIndexOf('banana')); // 3

// Find with starting index (searches backward)
console.log(fruits.lastIndexOf('banana', 2)); // 1
```
