let backPack = {
    color: 'blue',
    numOFZip: 5,
    numOfCupholder: 2,
    book: {
        color: 'blue',
        numOfPages: 80,
        subject: 'calculus'
    },
    message: function(){
        console.log("This is my backpack");
    },
    isHeavy: false,
    containMyLaptop: true,
    laptop: {
        color: 'silver',
        model: 'dell-Inspiron',
        screenSize: 14.0
    },
    display: function(){
        this.color = "black and blue"
      console.log(`My backpack is ${this.color} and has ${this.numOFZip} zippers`)
   console.log(`It contains a ${this.laptop.model} laptop`)
   let hasLaptop = this.containMyLaptop 
   ? "it contains" : "it doesn't contains it"
   console.log(`This backpack ${hasLaptop} my laptop`)
}
}

backPack.display();