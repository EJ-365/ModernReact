// from the previous code snippet
// inheritance basically a class that inherit from it parent
export class Item {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  describe(){
    return `${this.name} costs $${this.price}`
  }
}

const orange = new Item("orange", 10);
console.log(orange.name);
console.log(orange.describe())


// inherited class
/* extends keyword means taking/getting what the parent class have for free 
so PerishableItem get everything it parent has Item such as the name and price 

inside the constructor we added our own constructor object called expiryDate.

The super(name,price); calls the parent constructor or access it method
*/
class PerishableItem extends Item{
    constructor(name,price, expiryDate){
        super(name,price);
        this.expiryDate = expiryDate;
    }
}
const milk = new PerishableItem("milk", 4, "2026-01-01");
console.log(milk.describe());


// modules: check the main.js 