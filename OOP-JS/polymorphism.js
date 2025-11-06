/* Polymorphism means different classes can have methods with the same name, 
but each class does something different when you call that method the child classs/subclass
has to be inherited from the parent class. */
 
// Parent class 'Shape' every shapes have different way of calculating area 
// the super() keyword allow the sub classes to inherit the parent methods.
class Shape{
  calculateArea(){ // main method, the child classes will be inheriting from and no constructor 
    console.log("Area Calculation Formula depends on the shape");
  }
 }

// child class for circle
class Circle extends Shape{
  constructor(radius){
    super(); // because no constructor in the parent class
    this.radius = radius;
  }
  
  calculateArea(){ // same method in parent class, we overrode it
    return (Math.PI * this.radius * this.radius).toFixed(2); // pir^2 area..cir
  }
}

// child class for rectagle
class Rectangle extends Shape{
  constructor(width,height){
    super();
    this.width = width;
    this.height = height;
  }

  calculateArea(){
    return this.width * this.height; // weight x height
  }
}

// creating the objects
const myCircle = new Circle(5);
const myRect = new Rectangle(4,6);

// calling the method
console.log('Circle: ', myCircle.calculateArea());
console.log('Rectangle', myRect.calculateArea());