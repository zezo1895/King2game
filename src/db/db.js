import pizzaImg from "../images/pizza.png";
import burgerImg from "../images/burger.png";
import cocaImg from "../images/coca.jpg";
import saladImg from "../images/salad.jpg";
import waterImg from "../images/water.jpg";
import iceCreamImg from "../images/icecream.png";
import kebabImg from "../images/kebab.png";

export function getData() {
  return [
    { title: "110", price: 1, Image: burgerImg,id:1 },
    { title: "341", price: 3, Image: burgerImg,id:2 },
    { title: "572", price: 5, Image: burgerImg ,id:3},
    { title: "1166", price: 10, Image: burgerImg,id:4 },
    { title: "2398", price: 20, Image: burgerImg,id:5 },
    { title: "تصريح بوياه BP", price: 2.78, Image: waterImg,id:6 },
    { title: "أسبوعية WK", price: 2, Image: saladImg,id:7 },
    { title: "شهرية MT", price: 6.67, Image: cocaImg,id:8 },
    
  ];
}