
/**
 * The above JavaScript code defines functions to calculate the circumference, area, and volume of a
 * sphere based on its radius using the mathematical constant PI.
 * @param radius - The radius is the distance from the center of a circle or sphere to any point on its
 * circumference. It is a crucial parameter in calculating the circumference, area, and volume of a
 * circle or sphere.
 * @returns The code snippet provided defines three functions related to circles: `getCircumference`,
 * `getArea`, and `getVolume`.
 */
export const PI = 3.14159;

export function getCircumference(radius){
    return (2 * PI * radius);
}

export function getArea(radius) {
    return PI * Math.pow(radius, 2);
}

export function getVolume(radius){
    return (4/3) * PI * Math.pow(radius, 3);
}