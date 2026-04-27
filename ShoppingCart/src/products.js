import bag from "./assets/bag.png";
import cup from "./assets/cup.png";
import watch from "./assets/watch.jpeg";
import waterBottle from "./assets/water_bottle.png";

const productsData = [
  {
    id:crypto.randomUUID(),
    image: bag,
    title: "Canvas Tote Bag",
    price: 24.0,
   quantity: 1,
  },
  {id:crypto.randomUUID(),
    image: waterBottle,
    title: "Glass Water Bottle",
    price:  32.00,
    quantity: 1,
  },
  {
    id:crypto.randomUUID(),
    image: watch,
    title: "Minimalist Watch",
    price: 120.00,
    quantity: 1,
  },
  {
    id:crypto.randomUUID(),
    image: cup,
    title: "Ceramic Coffee Mug",
    price: 18.00,
    quantity: 1,
  },
];

export default productsData;