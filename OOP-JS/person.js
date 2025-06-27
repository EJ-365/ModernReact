// Object Literals
// This keyword; refers to the specific variable that's been call like pointing at someone directly
/*  object constructor: constuctor allows you to create multiple instances of an object 
instead of creating them one by one like the traditional way */
const person = {
    firstName: 'Mike',
    lastName: 'Wills',
    age: 30,
    greet: function(){
        // return "Good Morning";
       return `Hello Everyone my name is ${this.firstName} ${this.lastName}`
    },
}
// console.log(person.greet());



// object constructor: 'Remeber to  capitalize the first letter 
function Person(firstName, lastName, age){
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.greet = function(){
        return `Hello my name is: ${this.firstName} ${this.lastName}`
    }
}

// creating an instane
const ejay = new Person('Ejay', 'Gabriel', 22);
const recovery = new Person('Recovery', 'Martin', 24);
console.log(ejay);
console.log(recovery);
