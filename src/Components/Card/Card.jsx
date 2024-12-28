import React, { useEffect, useState } from "react";
import Button from "../Button/Button"; // Ensure Button component is properly imported
import "./Card.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGem } from "@fortawesome/free-solid-svg-icons";
import { FaCoins } from "react-icons/fa";

function Card({ food, onAdd, onRemove }) {
  const [count, setCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);
  // const { id, title, image, price } = food; // Destructure properties from food
console.log(food)
  const handleIncrement = () => {
    setCount(count + 1);
    onAdd(food); // Add to cart
  };

  const handleDecrement = () => {
    setCount(count - 1);
    onRemove(food); // Remove from cart
  };

  return (
    <>
    <div class={` mb-3 ${windowWidth < 350? "col-6" :"col-4 " }  `} key={food.id} style={{ padding:"0 5px" ,marginLeft:"auto",marginRight:"auto" }} >
<div class="product-card text-center">
  <div className="image-card">
    <img src={food.Image} alt="" />
  </div>
<div className="d-flex" style={{ justifyContent:"center"
  ,alignItems:"center"
 }}>
    <h5>
      {food.title}
  
    </h5>
    <FontAwesomeIcon
        style={{ marginLeft: "5px" }}
        icon={faGem}
        size={8}
        color="#47B9DB"
      />
</div>
  <p>
    <strong style={{ fontSize:".8rem" }}>Price: {food.price}   <FaCoins size={12} style={{ marginRight: "5px", color: "#ffc107" }} /></strong>
  </p>
  <div id="btn-container" class="btn-container">
    {count === 0 ? (
      <button onClick={(food) => {
        handleIncrement(food)
      }} class="btn-add">ADD</button>
    ) : (
      <>
        {" "}
        <button
          className="btn-decrement"
          // تقليل الكمية
          onClick={(food) => {
            handleDecrement(food)
          }}
        >
          -
        </button>
        <span className="quantity" >{count}</span>
        <button onClick={(food) => {
        handleIncrement(food)
      }}
          className="btn-increment"
          // زيادة الكمية
        >
          +
        </button>
      </>
    )}
  </div>
</div>
</div> 

</>
   
  );
}

export default Card;
