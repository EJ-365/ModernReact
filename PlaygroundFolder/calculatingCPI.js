/* This code calculate cpi in macro economics 
formula:  
CPI =  CP1-2021 - CPI-2020/ CPI-2020

 the 2021 means current price so; current price year - previous price year/ previous price year *  100*/

/*get price year and previous price year and subtract them
cpi hold the result from curr and prev years, multiply by 100 */


 const getCPI = (currentPriceYear, previousPriceYear) => {
    return `Your CPI is: ${((currentPriceYear - previousPriceYear) / previousPriceYear * 100).toFixed(1)}%`;
 }

 function display(){
 const getPriceOf2021 = 278.8;
 const  getPriceOf2020 = 260.5;
 const cpiIndex = getCPI(getPriceOf2021, getPriceOf2020);
 console.log(cpiIndex);
 } 

 display();


// array filter method
const school = ['WCJC', 'HCC', 'Lamar University', 'UH', 'UTA','UTD', 'UTSA', 'UNT'];
 const schoolNames = school.filter((num => num.startsWith('U')));
//  console.log(schoolNames);
