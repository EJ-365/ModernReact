// ES6 classes
/* basically everything here is ES6 even the super() method is also es6 the previous one in 
inheritance is es5 */
class Person{
    constructor(firstName, lastName, age){
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }

    greet(){
        return `Hello, my name is ${this.firstName} ${this.lastName}`;
    }

}

// creating another class; basically Subclass

class User extends Person{
    constructor(firstName,lastName, userName, password){
        super(firstName, lastName) // inheriting the Person class constructor parameters
        this.age = "N/A";
        this.userName = userName;
        this.password = password;

    }
}

const user1 = new User('John', 'Doe', 'mrJohn', 'john123' );
console.log(user1);
console.log(user1.greet());