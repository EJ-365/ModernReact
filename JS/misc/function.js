function counter (){
let count = 0;
return () => ++count;
}

const next = counter();
console.log(next())
console.log(next())


function evenOdd(num){
if(num % 2 === 0){
    return "Even";
}

else {
    return "Odd"
}
}

console.log(evenOdd(10))