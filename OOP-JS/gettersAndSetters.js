class Person {
  constructor(name, age) {
    this.name = name;
    this.myAge = age; // use a different internal property to avoid recursion
  }

  // getter to read the age
  get age() {
    return this.myAge;
  }

  // setter to update the age
  set age(value) {
    if (value < 0) {
      console.log("Age cannot be negative!");
    } else {
      this.myAge = value;
    }
  }
}

const person1 = new Person("Ejay", 22);
person1.age = -3; // cannot be negative

console.log(person1.age);
person1.age = 34; // shows 34

console.log(person1.age);
