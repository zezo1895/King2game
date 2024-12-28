import axios from "axios"; // Import Axios for API requests
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css"; // CSS styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap
import Mamaleek from "./Mamaleek"; // Mamaleek page component
import Navbar from "./Components/Navbar/navbar.js"; // Navbar component
import Card from "./Components/Card/Card"; // Card component
import Cart from "./Components/Cart/Cart"; // Cart component
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard"; // Admin Dashboard
import Addcredit from "./addcredit.jsx"; // Add Funds component
import PaymentPage from "./PaymentPage"; // Payment page component
import { Audio } from 'react-loader-spinner';
import logo from "./img/logo.png"; // Logo image
import Tradersaddcredit from "./tradersaddcredit.jsx";
const { getData } = require("./db/db");
const foods = getData();

function AppContent() {
  
  const [cartItems, setCartItems] = useState([]); // State for cart items
  const [funds, setFunds] = useState(0); // State for user funds
  const [error, setError] = useState(""); // Error message state
  const [loadingFunds, setLoadingFunds] = useState(true); // Loading state for fetching funds
  const [loadingProducts, setLoadingProducts] = useState(true); // Loading state for fetching products
  const [products, setProducts] = useState([]); // State for products
  const navigate = useNavigate(); // Hook for navigation

  axios.defaults.withCredentials = true; // Set credentials for Axios

  // Fetch funds from API on component mount
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    
        if (!telegram_id) {
          throw new Error("Telegram user ID not available.");
        }
    
        const response = await fetch("https://dc10-77-93-154-98.ngrok-free.app/api/getFunds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ telegram_id }),
        });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch funds: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        if (data.redirectBot && data.redirectPage) {
          // First, redirect to the Telegram bot link
          window.location.href = data.redirectBot;
    
          // After a short delay, redirect to /KRegister in the same WebView (same window)
          setTimeout(() => {
            window.location.href = data.redirectPage; // Redirect in the same window
          }, 1000); // Delay for 1 second to ensure bot redirection occurs first
          return;
        }
    
        // Parse the balance to a number (optional, if needed for calculations)
        const balance = parseFloat(data.balance);
    
        // Set funds state, ensuring the balance is a number
        setFunds(balance); // Update funds state
      } catch (err) {
        console.error("Error fetching funds:", err.message);
        setError(err.message); // Set error state
      } finally {
        setLoadingFunds(false); // Set loading to false for funds
      }
    };
    
    
    

    fetchFunds();
  }, []); // Empty dependency array to only run on component mount

  // Fetch products from API or database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://302c-102-44-184-25.ngrok-free.ap/api/products");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched products:", data); // Check the structure of data
  
        // If data is not an array, log it and return a meaningful message
        if (!Array.isArray(data)) {
          console.error("Expected an array of products but got:", data);
          setError("No products available at the moment.");
        } else if (data.length === 0) {
          console.log("No products available.");
          setError("No products available at the moment.");
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err.message);
        setError("There was an error fetching the products.");
      } finally {
        setLoadingProducts(false);
      }
    };
  
    fetchProducts();
  }, []);
  
  // Add item to cart
  const onAdd = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist) {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity + 1 } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...food, quantity: 1 }]);
    }
  

  };
  
  const onRemove = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist.quantity === 1) {
      setCartItems(cartItems.filter((x) => x.id !== food.id));
    } else {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity - 1 } : x
        )
      );
    }
  
    // Add the item price back to the funds

  };
  
 
  // Handle checkout
  const onCheckout = () => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }
  
    if (funds < total) {
      alert("Insufficient funds. Please add more funds.");
      return;
    }
    const images = cartItems.map(item => item.Image);
    // Pass the cartItems with image data to PaymentPage
    navigate("/payments", {
      state: {
        cartItems,  // Include cartItems with images here
        totalPrice: total,
        images,
      },
    });
  };

  // if (loadingFunds || loadingProducts) {
  //   return (
  //     <div className="loader d-flex" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", backgroundColor: "#1f2937", position: "absolute", top: "0", bottom: "0", left: "0", right: "0" }}>
  //       <Audio height="150" width="150" color="rgb(245, 184, 54)" ariaLabel="loading" />
  //       <img src={logo} alt="" />
  //     </div>
  //   ); // Show loading message
  // }

  return (
    <>
      <Navbar funds={funds} error={error} />

      <div class="container " style={{ paddingLeft:"5px",paddingRight:"5px", }}>
        <h2 style={{ color: "#fff",fontWeight:"600",marginTop:"30px",fontFamily:"revert" }} class="text-center mb-4">
          Available Products
        </h2>
        <div class="row d-flex"  style={{margin:"0",marginBottom:"75px",flexWrap:"wrap" }}>
          {foods.map((food) => {return(<Card food={food} onRemove={onRemove} onAdd={onAdd} />)
            
          })}
        </div>
      </div>

      <button
        className=" btn-checkout"
        style={{ width: "95%", marginTop: "50px" }}
        onClick={onCheckout}
      >
        Checkout
      </button>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/Mamaleek" element={<Mamaleek />} />
        <Route path="/addcredit" element={<Addcredit  />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/tradersaddcredit" element={<Tradersaddcredit />} />
      </Routes>
    </Router>
  );
}

export default App;
