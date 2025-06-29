

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



/* Prototypal inheritance or inheritance allows you to inherit properties or methods of another
object */

// create another object
 /* ".call" call the Person object above to inherit(take) the property of
 Person which is first and last name; remember to add 'this' keyword first follow by comma*/

function User(firstName, lastName, username, password){
 // inheriting the properties/attributes
Person.call(this, firstName, lastName); 
this.username = username;
this.password = password;
}

// inheriting the Person object prototype (use object.create() to inherit the prototype)
User.prototype = Object.create(Person.prototype)
const user1 = new User('John', 'Doe', 'johnDoe', 'John123');
// console.log(user1.greet());
console.log(user1);


/* Recap:
to inherit object properties from another obeject into a new objec
 use the call method you want to inherit like this
Person.call(this, property name)

to inherit a prototype from another object into a new object 
use: User.prototype = Object.create(Person.prototype)

* Notice that the 'Object.create()' the O is capitalize *
*/