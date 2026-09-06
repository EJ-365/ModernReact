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


// cart revisited
class Cart{
  constructor(){
    this.items = [];
  }
  addItem(item){
    this.items.push(item)
  }
  getTotal(){
    return this.items.reduce((acc,i) => acc + i.price, 0);
  }
}

const cart = new Cart();
cart.addItem = 100; // addItem method is not private
console.log(cart.addItem)