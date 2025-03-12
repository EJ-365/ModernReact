let backPack = {
  color: "blue",
  numOFZip: 5,
  numOfCupholder: 2,
  book: {
    color: "blue",
    numOfPages: 80,
    subject: "calculus",
  },
  message: function () {
    console.log("This is my backpack");
  },
  isHeavy: false,
  containMyLaptop: true,
  laptop: {
    color: "silver",
    model: "dell-Inspiron",
    screenSize: 14.0,
  },
  display: function () {
    this.color = "black and blue";
    console.log(
      `My backpack is ${this.color} and has ${this.numOFZip} zippers`
    );
    console.log(`contains ${this.laptop.model} laptop`);
    let hasLaptop = this.containMyLaptop ? "contains" : " doesn't contains";
    console.log(`This backpack ${hasLaptop} my laptop`);
  },
};

// backPack.display();
// console.log(backPack.laptop.screenSize);
// console.log(backPack.color);

/* we use this keyword inside an object to:
Reference the current object's properties and methods
Modify the object's own properties
Access values from nested objects within the current object
Create dynamic interactions between different properties of the same object
*/
