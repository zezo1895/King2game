import React, { useEffect, useState } from "react";
import { FaWallet, FaPlus, FaCoins } from "react-icons/fa"; // Importing coin icon
import { Link } from "react-router-dom";
import styles from "./Mamaleek.module.css";

// Importing local images
import bannerImage from "./img/banner.jpg"; // Replace with your desired image
import category1 from "./img/accounts.jpg"; // Example category images
import category2 from "./img/sellcodes.jpg";
import category3 from "./img/gwaher.jpg";
import category4 from "./img/rash2.jpg";

const Mamaleek = () => {
  const [funds, setFunds] = useState(0); // User-specific funds
  const [firstName, setFirstName] = useState("Guest"); // Default first name for fallback
  const [isLoading, setIsLoading] = useState(true); // Loading state for better user experience
  const [error, setError] = useState(null); // Error state for API issues

  useEffect(() => {
    const tele = window.Telegram?.WebApp;

    // Check if Telegram WebApp is available
    if (tele?.initDataUnsafe && tele.initDataUnsafe.user) {
      const { id, first_name } = tele.initDataUnsafe.user;

      // Set user's first name and fetch funds
      setFirstName(first_name || "Guest");
      fetchUserFunds(id)
        .then((userFunds) => {
          setFunds(userFunds);
          setIsLoading(false); // Data loaded successfully
        })
        .catch((err) => {
          console.error("Error fetching funds:", err);
          setError("Failed to load funds. Please try again later.");
          setIsLoading(false); // End loading even on error
        });
    } else {
      console.warn("Telegram WebApp not detected. Using fallback values.");
      setIsLoading(false); // No user data, stop loading
    }

    // Ensure the Telegram WebApp is initialized
    tele?.ready();
  }, []);

  // API call to fetch funds
  const fetchUserFunds = async (userId) => {
    try {
      const response = await fetch(`/api/getFunds?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch funds");
      }
      const data = await response.json();
      return data.funds || 0; // Default to 0 if no funds are found
    } catch (error) {
      throw new Error("Error connecting to the server");
    }
  };

  const categories = [
    { title: "بيع وشراء حسابات فري فاير", image: category1, link: "/FreeFireAccounts" },
    { title: "بيع كودات", image: category2, link: "/CodeSelling" },
    { title: "شحن جواهر", image: category3, link: "/DiamondSelling" },
    { title: "رشق انستاجرام", image: category4, link: "/Instagram" },
  ];

  return (
    <div className={styles.appContainer}>
      {/* Navbar with user name on the left and wallet icons on the right */}
      <nav className={styles.navBar}>
        {/* Left side - User name */}
        <div className={styles.left}>
          <h1>{firstName}</h1>
        </div>

        {/* Right side - Wallet section */}
        <div className={styles.right}>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : (
                <div className={styles.fundsContainer}>
  
  
  <Link to="/addfunds">
    <FaPlus size={18} className={styles.icon} style={{ color: "#ffffff" }} />
  </Link>
  <span className={styles.fundsValue}>
    <FaCoins size={16} style={{ marginRight: "5px", color: "#ffc107" }} />
    {funds.toFixed(0)} {/* Converts funds to a string and removes decimals */}
  </span>
  <FaWallet size={24} color="#ffffff" className={styles.icon} />
</div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Header with user information */}
      <header className={styles.header}>
        {isLoading ? (
          <p>Loading user data...</p>
        ) : (
          <div className={styles.greetingContainer}></div>
        )}
      </header>

      {/* Single Banner Image */}
      <main className={styles.main}>
        <div className={styles.bannerContainer}>
          <img src={bannerImage} alt="Banner" className={styles.bannerImage} />
        </div>
      </main>

      {/* Product Categories */}
      <section className={styles.categories}>
        {categories.map((category, index) => (
          <Link to={category.link} key={index} className={styles.categoryCard}>
            <img src={category.image} alt={`Category ${index}`} className={styles.categoryImage} />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Mamaleek;
