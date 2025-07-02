/* what is classes? 
Classes in JavaScript are templates for creating objects
 and encapsulating data and behavior together. 
 They provide a way to define object blueprints with properties and methods.
*/

// ES6 Classes
class Person{
    constructor(firstName, lastName, age){
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }

    greet(){
        return `Hello, my name is ${this.firstName} ${this.lastName}`;
    }

    static hello(){
        return `Hello ${firstName}`;
    }
}

const p1 = new Person('Ejay', 'Gabriel', 22);
const p2 = new Person('Bri', 'Ejay', 18);
console.log(Person.hello());