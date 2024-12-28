import React from "react";
import "./Cart.css";
import Button from "../Button/Button";
function Cart({ cartItems, onCheckout }) {
  const totalPrice = cartItems.reduce((a, c) => a + c.price * c.quantity, 0);

  return (
    <div className="cart__container">
     
      <br />
<span className="">
  المجموع الكلي: {totalPrice.toFixed(2)} عملة
</span>
     
    </div>
  );
}

export default Cart;
