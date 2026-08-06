/* Code a for loop that runs through all numbers from 0-99 and append all numbers divisible by seven into a string. Return this string. */

function easyLoop(){
    let str = "";
    for(let i = 0; i <= 99; i++){
       if(i % 7 === 0){
        str =+ i;
       }
    }
    return str;
}

//  console.log(easyLoop());

// string to a numbers
(function stringsToNumber(string){
    const result = parseInt(string);
    console.log(result);
}) ("123");