const { or } = require("three/tsl");

class Item {
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