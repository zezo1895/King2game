import React, { useEffect, useState } from "react";
import { FaWallet, FaPlus, FaCoins, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate for dynamic navigation
import styles from "./Navbar.module.css"; // Assuming the CSS file exists
import pic from "../../images/avtar.png"
const Navbar2 = ({ funds, isLoading, error }) => {
  const [firstName, setFirstName] = useState("Guest");
  const [userId, setUserId] = useState("Guest");
  const [userPhoto, setUserPhoto] = useState('');
  const navigate = useNavigate(); // Hook for navigation
const location=useLocation()
  useEffect(() => {
    // Get the user's first name from Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe;
      if (telegramUser && telegramUser.user) {
        setFirstName(telegramUser.user.first_name); // Set Telegram first name
        setUserId(telegramUser.user.id);
        if (telegramUser.user.photo_url) {
          setUserPhoto(telegramUser.user.photo_url);
        }
      }
    }
  }, []); // This will run once when the component mounts

  // Handle button click for redirection based on membership
  const handleRedirect = async () => {
    try {
      if (!userId) throw new Error("Telegram user ID not available.");

      const response = await fetch("https://dc10-77-93-154-98.ngrok-free.app/api/getMembership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telegram_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch membership: ${response.statusText}`);
      }

      const data = await response.json();

      // Redirect based on membership status
      if (data.membership === "admin" || data.membership === "not admin") {
        navigate("/tradersaddcredit");
      } else {
        navigate("/addcredit");
      }
    } catch (err) {
      console.error("Error handling redirect:", err.message);
      alert("An error occurred while checking user permissions.");
    }
  };

  // Ensure funds is a valid number or fallback to 0
  const displayFunds = typeof funds === "number" ? funds.toFixed(2) : "0.00";

  return (
    <nav style={{width:"100%"}} className="navbar navbar-custom">
    <div className="user-info d-flex align-items-center">
      <img
        src={userPhoto == null? pic:userPhoto}
        alt="User Photo"
        className="user-photo me-3"
        
      />
      <div>
        <strong>{firstName}</strong>
        <br />
        <span id="balance-display" className="balance">
          Balance: {displayFunds}                  <FaCoins size={16} style={{ marginRight: "5px", color: "#ffc107" }} />

        </span>
      </div>
    </div>

    <Link to={"/"} className="btn-back-circle">
      <i className="fas fa-arrow-left">   <FaArrowLeft size={18}  /></i>
    </Link>
  </nav>
  );
};

export default Navbar2;
