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
        console.log("That's i have in my backpack");
    }
}