import React, { useEffect, useState } from "react";
import { FaWallet, FaPlus, FaCoins } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css"; // Importing CSS
import pic from "../../images/avtar.png"; // Default avatar image

const Navbar = ({ funds, isLoading, error }) => {
  const [firstName, setFirstName] = useState("Guest");
  const [userId, setUserId] = useState("Guest");
  const [userPhoto, setUserPhoto] = useState(""); // User photo URL
  const [membershipType, setMembershipType] = useState(null); // Membership status
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();

  useEffect(() => {
    // Get the user's details from Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe;
      if (telegramUser && telegramUser.user) {
        setFirstName(telegramUser.user.first_name);
        setUserId(telegramUser.user.id);
        setUserPhoto(telegramUser.user.photo_url || pic); // Fallback to default photo
      }
    }
  }, []);

  
  const handleRedirect = async () => {
    try {
      if (!userId) throw new Error("Telegram user ID not available.");
  
      const response = await fetch(
        "https://dc10-77-93-154-98.ngrok-free.app/api/getMembership",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ telegram_id: userId }),
        }
      );
  
      // Check if response is valid
      if (!response.ok) {
        console.error(`Response error: ${response.statusText}`);
        navigate("/addcredit");
        return; // Stop further execution
      }
  
      const data = await response.json();
      console.log("API Response:", data); // Debugging: log the response
  
      // Check membership and redirect
      if (data.membership === "admin" || data.membership === "not admin") {
        navigate("/tradersaddcredit");
      } else {
        navigate("/addcredit");
      }
    } catch (err) {
      // Only catch real errors (e.g., network issues)
      console.error("Network or unexpected error:", err.message);
      alert("An unexpected error occurred. Redirecting to Add Credit.");
      navigate("/addcredit");
    }
  };
  

  // Format funds display
  const displayFunds = typeof funds === "number" ? funds.toFixed(2) : "0.00";

  return (
    <nav className="navbar navbar-custom d-flex justify-content-between align-items-center">
      {/* User Info Section */}
      <div className="user-info d-flex align-items-center">
        <img
          src={userPhoto}
          alt="User Avatar"
          className="user-photo me-3"
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
        <div>
          <strong>{firstName}</strong>
          <br />
          <span id="balance-display" className="balance">
            Balance: {displayFunds}{" "}
            <FaCoins size={16} style={{ marginRight: "5px", color: "#ffc107" }} />
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link onClick={handleRedirect} className="btn-back-circle">
        <FaPlus size={18} style={{ color: "#fff" }} />
      </Link>
    </nav>
  );
};

export default Navbar;
