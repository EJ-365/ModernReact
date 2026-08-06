// datatype and coercion
/* 
Truthy/Falsy:

falsy: 0, "", null, undefined, NaN, and false
truthy: non-empty strings and everything else apart from those mentioned above

== vs === : == coerces types, === checks strictly; 
basically saying that 
== normal equality not recommended in js causes type coercion; === strict equality recommended and 
doesn't forces any type coercion
*/

// tiny Challenge
console.log([] ==! []) // false i think

// note that empty array is truthy but when compare to a number it coerces to false



// scratch work;
console.log(Number([]));
console.log([] == false); // [] -> 0 -> false and it's a loose equality
console.log([] == 0)  // [] -> 0; 0==0 with loose equality

// more examples 

console.log(typeof "hello");
console.log(typeof 42);
console.log(typeof true);
console.log(typeof null);
console.log(typeof {});
console.log(typeof []);
console.log(typeof function() {});

// truthy and falsy value
if([]){
    console.log("Truthy");
}


if(0){
    console.log("This won't run") // 0 is falsy
}


// recap:
// falsy values:
/* 
0, "", undefined, null, NaN and false

truthy value:
true, [], {} and non-empty strings
*/

// practice Challenge
console.log("" == 0);
console.log("0" == 0)
console.log("" === 0)



// Challenge

function isFalsy(value){
    return !value
}

console.log(isFalsy("hello"));
