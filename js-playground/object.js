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
demo.innerHTML = "<br>" + myInfo.name + "</br>";
demo.innerHTML += "<br>" + myInfo.age + "</br>";
demo.innerHTML += `<br> ${myInfo.favSport} </br>`;