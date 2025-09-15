/* This code snippet is importing constants and functions from a module called `mathUtil.js` using ES6
module syntax. It then calculates and logs the area, volume, and circumference of a circle with a
radius of 10. */
import {PI, getArea, getVolume, getCircumference} from './mathUtil.js';
console.log(PI);

const area = getArea(10);
console.log(`${area.toFixed(2)}cm^2`);

const volume = getVolume(10);
console.log(`${volume.toFixed(2)}cm^3`);

const circumference = getCircumference(10);
console.log(`${circumference.toFixed(2)}cm`);