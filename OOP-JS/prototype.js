/* prototype allows you to add new properties to object constructors */
function Person(firstName, lastName, age) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.age = age;
  this.currentYear = new Date().getFullYear();
}

// Greet prototype

Person.prototype.greet = function () {
  return `Hello, my name is ${this.firstName} ${this.lastName}`;
};

// Birth Year prototype
Person.prototype.birthYear = function () {
  return this.currentYear - this.age;
};

// Person object instances
const ejay = new Person("Ejay", "Gabriel", 22);
const recovery = new Person("Recovery", "Martin", 24);

console.log(ejay.birthYear());
console.log(recovery.birthYear());

/*
EXPLANATION:
If you put a method (like greet) inside the constructor, every object you create gets its own separate copy of that method in memory.
If you create 100 people, there are 100 greet functions—one for each person. This uses more memory.

A prototype is like a shared toolbox for all objects created from a constructor.
If you put the method on the prototype (Person.prototype.greet), all Person objects share ONE greet function.
If you create 100 people, they all use the same function from the prototype, saving memory.

Summary:
- Method inside constructor: each object has its own copy (not efficient).
- Method on prototype: all objects share one copy (efficient, best practice).

Analogy:
Constructor method = every student gets their own book.
Prototype method = all students use the same book
*/
