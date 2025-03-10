const myInfo = {
    name: 'Ejay E. Gabriel',
    age: 22,
    favFood: 'fufu',
    favSport: 'soccer',
    quote: function(){
        document.write("It's what it's")   
     },
}

let demo = document.getElementById('demo');
demo.innerHTML = myInfo.name;