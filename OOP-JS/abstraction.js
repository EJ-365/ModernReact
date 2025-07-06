class Vehicle{
  constructor(type){
    this.type = type;
  }
    
  startEngine(){
   throw new Error("startEngine() must be implemented in a child class")
 } 
  }

class Car extends Vehicle{
   startEngine(){
    console.log("Car Engine starting")
  }
}
class Bike extends Vehicle{
   startEngine(){
    console.log("Bike Engine starting")
  }
}

const myCar = new Car('Car');
myCar.startEngine();
