import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";
import { FaArrowRight, FaCoins } from "react-icons/fa";
import Swal from 'sweetalert2';

function PaymentPage() {
  // Access passed state
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure cartItems and totalPrice from location state
  const { cartItems = [], totalPrice = 0 } = location.state || {};

  // State variables
  const [gameUserId, setGameUserId] = useState(""); // To store Game User ID
  const [error, setError] = useState(""); // Validation error messages
  const [loading, setLoading] = useState(false); // Loading indicator for payment process
  const [remainingFunds, setRemainingFunds] = useState(null); // Remaining funds after payment

  // Initialize Telegram WebApp data
  const tele = window.Telegram?.WebApp;
  const telegram_id = tele?.initDataUnsafe?.user?.id;

  if (!telegram_id) {
    console.error("Telegram WebApp not initialized or User ID missing.");
  }

  // Handle input changes
  const handleGameUserIdChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Allow only numeric input
      setGameUserId(value);
      setError(""); // Clear errors when input changes
    }
  };

  // Handle payment process
  const handlePayment = async () => {
    // Basic validations
    if (!telegram_id) {
      setError("Telegram User ID is not available.");
      return;
    }

    if (!gameUserId.trim()) {
      setError("Game User ID is required.");
      return;
    }

    setLoading(true); // Show loading indicator

    // Create a trimmed version of the cart items for SQL payload
    const cartItemsForSQL = cartItems.map((item) => ({
      ...item,
      Image: item.Image && item.Image.trim() ? item.Image.trim() : null, // Trim image URL or set to null
      title: item.title ? item.title.replace(/[^\x00-\x7F]/g, "").trim() : "", // Remove non-English characters from the title
    }));

    const payload = {
      telegram_id,
      amount: totalPrice,
      gameUserId, // Send Game User ID
      cartItems: cartItemsForSQL, // Send trimmed cart items to the backend
    };

    console.log("Request Payload for SQL:", payload); // Debugging purpose

    try {
      // Send request to the backend API with credentials
      const response = await axios.post(
        "https://dc10-77-93-154-98.ngrok-free.app/api/deductFunds",
        payload,
        {
          withCredentials: true, // Include credentials in the request
        }
      );

      if (response.status === 200) {
        // Payment successful
        setRemainingFunds(response.data.remainingFunds);
        Swal.fire({
          title: 'Done',
          text: 'Payment successful Order completed.',
          icon: 'success',
          confirmButtonText: 'ok',
          confirmButtonColor: '#ffc107' , // تغيير لون الزر بناءً على الوضع
          background: '#333' , // خلفية الوضع المظلم أو الفاتح
          color: '#fff' , // تغيير لون النص بناءً على الوضع
        });
        navigate("/"); // Redirect to home or desired page
      } else {
        // Handle response with errors
        Swal.fire({
          title: 'error',
          text: 'Failed to process the payment. Please try again.',
          icon: 'error',
          confirmButtonText: 'ok',
          confirmButtonColor: 'red' , // تغيير لون الزر بناءً على الوضع
          background: '#333' , // خلفية الوضع المظلم أو الفاتح
          color: '#fff' , // تغيير لون النص بناءً على الوضع
        });
        setError(response.data.message || "Failed to process the payment. Please try again.");
      }
    } catch (err) {
      console.error("Error during payment:", err.response || err);
      setError(
        err.response?.data?.message || "An error occurred while processing the payment."
      );
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="payment-page" style={{ minHeight: "100vh" }}>
    <section className="order-details d-flex">
      <div className=" order d-flex" style={{ justifyContent:'space-between',alignItems:"center" }}>
        <h2 style={{ paddingTop:"15px" }} className="order-title">YOUR ORDER</h2>
        <Link to={"/"} className="btn-back-circle mb-2">
      <i className="fas fa-arrow-left">   <FaArrowRight size={18}   /></i>
    </Link>
      </div>
      {cartItems.length === 0 ? (
          <p>No items in your order.</p>
        ) : (cartItems.map((item)=>{
          return( <div className="order-item d-flex " >
            <div className="left-details d-flex">
              <div className="image-details"><img src={item.Image || "burger.png"} alt="" /></div>
              <div style={{ textAlign:"left" }} className="details ">
                <div className="oredr-name">{item.title} </div>
                <div className="quantity">{item.quantity}X</div>
              </div>
            </div>
            <div className="right-details">
            {(item.price * item.quantity).toFixed(2)} <FaCoins size={12} style={{ marginRight: "5px", color: "#ffc107" }}/>
            </div>
            </div>)
        }))}
  
  <div className="user-id-container">
  <input
    type="number" // Restricts input to numbers
    placeholder="Enter Game User ID"
    style={{ width: "100%" }}
    value={gameUserId}
    onChange={handleGameUserIdChange}
    className="game-user-id-input"
  />
</div>
  
    
      

    
    </section>

    <button
      style={{ backgroundColor: "#ffc107",width:"90%",margin:"10px auto",borderRadius:"10px",fontSize:"1.3rem", fontWeight:"600" }}
      className="footer-button"
      onClick={handlePayment}
    >
{loading ? "Processing..." : `Pay ${totalPrice.toFixed(2)}`} {/* Dynamic button text */}
    </button>
  </div>
  );
}

export default PaymentPage;
