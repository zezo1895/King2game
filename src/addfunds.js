import React, { useState, useEffect } from "react";
import Navbar from "./Components/Navbar/navbar";
import Banner from "./Components/banner/banner";
import styles from "./addfunds.module.css";

// Replace these with actual images for your payment methods
import method1 from "./img/method1.jpg";
import method2 from "./img/method2.jpg";
import method3 from "./img/method3.jpg";
import method4 from "./img/method4.jpg";

const AddFunds = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [proofImage, setProofImage] = useState(null);
  const [telegramUserId, setTelegramUserId] = useState(null); // Dynamic Telegram User ID

  // Hardcoded or fetched payment methods
  const paymentMethods = [
    { id: 1, name: "Orange Money (Jordan)", image: method1, currency: "JOD", conversionRate: 0.7 },
    { id: 2, name: "Alrajihi Bank (Saudi Arabia)", image: method2, currency: "SAR", conversionRate: 2.63 },
    { id: 3, name: "Bank Transfer (Worldwide)", image: method3, currency: "USD", conversionRate: 1 },
    { id: 4, name: "Binance Pay (Worldwide)", image: method4, currency: "USDT", conversionRate: 1 },
  ];

  const bankDetails = {
    2: {
      accountName: "Alrajihi Account Name",
      accountNumber: "123-456-789",
      branch: "Riyadh Branch",
    },
    3: {
      accountName: "Bank Transfer Account Name",
      accountNumber: "987-654-321",
      branch: "Global Branch",
    },
  };

  useEffect(() => {
    // Fetch the Telegram User ID dynamically from your backend or session storage.
    // For example, if your backend provides the user ID, you can fetch it like this:
    const fetchTelegramUserId = async () => {
      try {
        // Assuming you have an endpoint to get the user's Telegram ID
        const response = await fetch("http://localhost:5000/api/getTelegramUserId", {
          method: "GET",
        });
        const data = await response.json();
        setTelegramUserId(data.userId); // Set the Telegram user ID
      } catch (error) {
        console.error("Error fetching Telegram User ID", error);
      }
    };

    fetchTelegramUserId();
  }, []);

  const handleMethodSelect = (id) => {
    setSelectedMethod(id);
    setFundAmount("");
    setConvertedAmount(0);
    setProofImage(null);
  };

  const handleFundChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setFundAmount(amount);

    if (selectedMethod) {
      const rate = paymentMethods.find((method) => method.id === selectedMethod).conversionRate;
      setConvertedAmount(amount * rate);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProofImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }

    const selected = paymentMethods.find((m) => m.id === selectedMethod);

    if (!proofImage) {
      alert("Please upload proof of payment.");
      return;
    }

    if (fundAmount <= 0) {
      alert("Please enter a valid fund amount.");
      return;
    }

    if (!telegramUserId) {
      alert("Telegram User ID is not available. Please log in first.");
      return;
    }

    const message = `
    New Fund Request:
    - Payment Method: ${selected.name}
    - Amount: ${fundAmount} (${convertedAmount.toFixed(2)} ${selected.currency})
    - Telegram User ID: ${telegramUserId}
    - Proof of Payment: ${proofImage.name || "Not uploaded"}
    `;

    const BOT_TOKEN = "<7754966695:AAEwt9Xz4J3Q1CijW00wvK01xHr_Y-U76W8>";
    const CHAT_ID = "<5800924684>";
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      });

      if (response.ok) {
        alert("Payment details sent to Telegram bot successfully!");
      } else {
        alert("Failed to send details to Telegram bot.");
      }
    } catch (error) {
      console.error("Error sending details to Telegram bot:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.appContainer}>
      <Navbar firstName="Guest" funds={0} isLoading={false} error={null} />
      <Banner />
      <div className={styles.content}>
        <h2>Select Payment Method</h2>
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
          <div className={styles.paymentOptions}>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`${styles.paymentOption} ${
                  selectedMethod === method.id ? styles.selected : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="paymentMethod"
                  checked={selectedMethod === method.id}
                  onChange={() => handleMethodSelect(method.id)}
                  className={styles.checkbox}
                />
                <img src={method.image} alt={method.name} className={styles.paymentImage} />
                <span>{method.name}</span>
              </label>
            ))}
          </div>

          {selectedMethod && (
            <>
              <div className={styles.amountSection}>
                <label htmlFor="fundAmount">Enter Fund Amount:</label>
                <input
                  type="number"
                  id="fundAmount"
                  value={fundAmount}
                  onChange={handleFundChange}
                  placeholder="Enter amount"
                  className={styles.input}
                />
                <div className={styles.calculatedAmount}>
                  <p>
                    Equivalent in{" "}
                    {paymentMethods.find((method) => method.id === selectedMethod).currency}:{" "}
                    {convertedAmount.toFixed(2)}{" "}
                    {paymentMethods.find((method) => method.id === selectedMethod).currency}
                  </p>
                </div>
              </div>
            </>
          )}

          {selectedMethod === 1 && (
            <div className={styles.orangeFields}>
              <h3>Orange Money Information:</h3>
              <p>
                <strong>Number:</strong> +962123456789
              </p>
              <label htmlFor="proofImage">Upload Payment Proof:</label>
              <input
                type="file"
                id="proofImage"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.input}
              />
              {proofImage && <p>Uploaded File: {proofImage.name}</p>}
            </div>
          )}

          {(selectedMethod === 2 || selectedMethod === 3) && (
            <div className={styles.bankFields}>
              <h3>Bank Account Details:</h3>
              <p>
                <strong>Account Name:</strong> {bankDetails[selectedMethod].accountName}
              </p>
              <p>
                <strong>Account Number:</strong> {bankDetails[selectedMethod].accountNumber}
              </p>
              <p>
                <strong>Branch:</strong> {bankDetails[selectedMethod].branch}
              </p>
              <label htmlFor="proofImage">Upload Payment Proof:</label>
              <input
                type="file"
                id="proofImage"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.input}
              />
              {proofImage && <p>Uploaded File: {proofImage.name}</p>}
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFunds;
