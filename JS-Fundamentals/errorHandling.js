/* 
Error Handling: 
The code snippet you provided is a JavaScript program that prompts the user to enter a dividend and
a divisor, then calculates the result of dividing the dividend by the divisor. */
// apply it to html 

try{
    const dividend = Number(prompt("Enter the dividend"));
    const divisor = Number(prompt("Enter the divisor"));

    if (divisor == 0) {
        throw new Error("You can't divide by zero!!")
    }
    
    else if (isNaN(dividend) || isNaN(divisor)) {
    throw new Error("Not a number, please enter a number!!")
    }

    const result =  dividend / divisor
    console.log(result)
}

catch (err) {
    console.error(err)
}

finally {
    console.log("completed")
}

console.log("Program stop")