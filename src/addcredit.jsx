import React, { useRef, useState, useEffect } from "react";
import "./addcredit.css";
import CryptoJS from "crypto-js";
import method1 from "./img/method1.png";
import method2 from "./img/method2 (2).png";
import method3 from "./img/method3 (3).png";
import method4 from "./img/method4.png";
import method5 from "./img/method5.png";
import method6 from "./img/method6.png";
import logo from "./img/logo.png";
import Swal from 'sweetalert2';
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCloudArrowUp, faCopy, faMoneyBill, faWallet } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Components/Navbar/navbar";
import { Audio } from "react-loader-spinner";
import Navbar2 from "./Components/Navbar/navbar2";
import { FaCoins } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Addcredit = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState(null);
  const [paymentLink, setPaymentLink] = useState(""); // To store Binance Pay link
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [telegramUserId, setTelegramUserId] = useState(null); // Store Telegram User ID
  const [firstName, setFirstName] = useState(""); // Store Telegram first name
  const [imageFile, setImageFile] = useState(null); // Store the selected image
  const [imagename,setimagename]=useState(null)
  const [uploading, setUploading] = useState(false); // Track upload status
  const [inputvalue, setinputvalue] = useState(null);
  const [funds, setFunds] = useState(0); // State for user funds
  const [error, setError] = useState(""); // Error message state
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [loadingorder, setLoadingorder] = useState(false);
  const [id, setid] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  // Fetch Telegram User Data on component mount
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramData = window.Telegram.WebApp.initDataUnsafe;
      if (telegramData?.user?.id) {
        setTelegramUserId(telegramData.user.id);
        setFirstName(telegramData.user.first_name); // Get the first name
      } else {
        console.error("Telegram user data not found.");
      }
    } else {
      console.error("Telegram WebApp SDK is not available.");
    }
    setSelectedMethod(paymentMethods[0]);
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
    
        // Format balance to two decimal places
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
  }, []);
  async function generatePaymentLink(convertedAmount, amount) {
    const secretKey = "1234567890123456"; // The secret key
  
    // Payment data
    const paymentData = {
      usdt: convertedAmount, // Amount in USDT (to pay)
      coins: amount, // Number of coins (product quantity)
    };
  
    // Encrypt the data using the secret key
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(paymentData),
      CryptoJS.enc.Utf8.parse(secretKey),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    ).toString();
  
    try {
      // API call to generate the payment link
      console.log("Sending request to generate payment link...");
  
      const response = await fetch("https://892d-188-245-39-219.ngrok-free.app/get_link", {
        method: "POST", // Ensure it's a POST request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encrypted_data: encryptedData }),
      });
  
      // Check for successful response
      console.log("Response received, status:", response.status);
      if (!response.ok) {
        const errorMessage = await response.text();
        if (response.status === 415) {
          console.error("Unsupported Media Type - The server cannot process this request.");
        }
        throw new Error(errorMessage || "Failed to generate payment link.");
      }
  
      const result = await response.json();
  
      // Log the result for debugging
      console.log("Payment link generated:", result);
  
      // If the response is successful, show the payment link
      Swal.fire({
        title: "Payment Link Generated",
        html: `
          <p>Your Binance payment link is ready.</p>
          <a href="${result.payment_link}" target="_blank" style="display: inline-block; width: 50%; background: linear-gradient(135deg, #333, #444); color: #ffc107; text-align: center; padding: 10px; border-radius: 5px; text-decoration: none;">انقر هنا للدفع</a>
          <p>Transaction ID: ${result.trans_id}</p>
          <p>Expires At: ${result.expire_time}</p>
        `,
        icon: "success",
        confirmButtonText: "close",
        confirmButtonColor: "#ffc107",
      });
  
      // After generating the payment link, send data to the database
      console.log("Sending request to insert data into the database...");
  
      const insertResponse = await fetch("https://dc10-77-93-154-98.ngrok-free.app/insert_to_db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_link: result.payment_link,
          trans_id: result.trans_id,
          coins: convertedAmount, // Number of coins (product quantity)
          amount: amount, // Payment amount (in USDT)
          method: "binance pay",
          currency: "USDT",
          telegram_id: telegramUserId, // Replace telegramUserId with your actual Telegram WebApp user ID
          state: "not_pay",
        }),
      });
  
      // Check for a successful database insertion response
      console.log("Database insertion response status:", insertResponse.status);
      if (!insertResponse.ok) {
        const dbErrorMessage = await insertResponse.text();
        throw new Error(dbErrorMessage || "Failed to insert data into the database.");
      }
  
      console.log("Data inserted into the database successfully.");
    } catch (error) {
      // Handle errors and display the error message
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: `An error occurred: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  }
  
  const handleClick = (method) => {
    setSelectedMethod(method);
    setid(method.id)
    setAmount("");
    setConvertedAmount(0);
  };

  const handleAmountChange = (value) => {
    let numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {

      setAmount(null);
      setConvertedAmount(0);
      Swal.fire({
        title: 'error',
        text: 'Please enter a valid amount greater than zero',
        icon: 'error',
        confirmButtonText: 'ok',
        confirmButtonColor: 'red' , // تغيير لون الزر بناءً على الوضع
        background: '#333' , // خلفية الوضع المظلم أو الفاتح
        color: '#fff' , // تغيير لون النص بناءً على الوضع
      });
    } else if(/^\d*\.?\d{0,2}$/.test(numericValue)){
      setAmount(numericValue);
      setConvertedAmount((numericValue * selectedMethod.conversionRate).toFixed(2));
    }
  };
  

  const handleFileChange = (e) => {
    const file=e.target.files[0]
    setImageFile(file);
    setimagename(file.name)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate inputs
    if (!selectedMethod) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a payment method.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        background: '#333',
        color: '#fff',
      });
      return;
    }
  
    if (!amount || parseFloat(amount) <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid amount greater than zero.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        background: '#333',
        color: '#fff',
      });
      return;
    }
  
    if (!convertedAmount) {
      Swal.fire({
        title: 'Error',
        text: 'Conversion amount is not valid.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        background: '#333',
        color: '#fff',
      });
      return;
    }
  
    if (!telegramUserId) {
      Swal.fire({
        title: 'Error',
        text: 'Unable to retrieve Telegram User ID. Please reload and try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        background: '#333',
        color: '#fff',
      });
      return;
    }
  
    try {
      setLoadingorder(true);
  
      // Check if the selected method is Binance Pay
      if (selectedMethod.name === "Binance Pay") {
        // Call the generatePaymentLink function to handle the Binance Pay process
        await generatePaymentLink(amount, convertedAmount);
      } else {
        // Handle non-Binance payment methods (requires proof of payment)
        if (!imageFile) {
          Swal.fire({
            title: 'Error',
            text: 'Please upload a proof of payment.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: 'red',
            background: '#333',
            color: '#fff',
          });
          return;
        }
  
        // Upload the image to Cloudinary
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "default_preset");
        formData.append("cloud_name", "dy4gu2fk7");
  
        const uploadResponse = await fetch("https://api.cloudinary.com/v1_1/dy4gu2fk7/image/upload", {
          method: "POST",
          body: formData,
        });
  
        const uploadResult = await uploadResponse.json();
  
        if (!uploadResponse.ok) {
          Swal.fire({
            title: 'Error',
            text: 'Failed to upload image.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: 'red',
            background: '#333',
            color: '#fff',
          });
          throw new Error(uploadResult.error?.message || "Failed to upload image.");
        }
  
        // Prepare payload with image URL for non-Binance payment methods
        const payload = {
          telegramUserId,
          paymentMethod: selectedMethod.name,
          amount,
          convertedAmount,
          currency: selectedMethod.currency,
          imageUrl: uploadResult.secure_url,
        };
  
        // Call backend to store order confirmation
        const response = await fetch("https://dc10-77-93-154-98.ngrok-free.app/api/storeOrderConfirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          Swal.fire({
            title: 'Done',
            text: 'Your request has been sent successfully. Please wait for confirmation.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ffc107',
          });
          // Reset the form state
          setSelectedMethod(null);
          setAmount("");
          setConvertedAmount(null);
          setImageFile(null);
          navigate("/");
        } else {
          throw new Error(result.message || "Failed to submit the payment.");
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while processing your request. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        background: '#333',
        color: '#fff',
      });
    } finally {
      setLoadingorder(false);
    }
  };
  
  

  const paymentMethods = [
    {
      id: 1,
      name: "Orange Money (Jordan)",
      image: method1,
      currency: "JOD",
      conversionRate: 0.69,
      accountName: "HASSAN KHALED HASSAN ELHSENAT",
      accountNumber: "0777515306",
      branch: "--",eban:"--"
    },
    {
      id: 2,
      name: "Alrajihi Bank (Saudi Arabia)",
      image: method2,
      currency: "SAR",
      conversionRate: 0,
      accountName: "--",
      accountNumber: "--",
      branch: "--",eban:"--"
    },
    {
      id: 3,
      name: "CoinEX",
      image: method3,
      currency: "USD",
      accountName: "Itzhaso1",
      conversionRate: 0.8,
      accountNumber: "Hasan.baara2333@gmail.com",
      branch: "--",eban:"--"
    },
    {
      id: 4,
      name: "TRC20 Wallet",
      image: method4,
      accountName: "Itz_haso1",
      currency: "USDT",
      conversionRate: 0.8,
      accountNumber: "TD8KtQQbD95cX2GhFpXJaPHfFT3aiygTvw",
      branch: "--",eban:"734296340"
    },  {
      id: 5,
      name: "Stc Pay",
      image: method5,
      accountName: "0530283847",
      currency: "SAR",
      conversionRate: 3.4,
      accountNumber: "--",
      branch: "--",eban:"--"
    },
    {
      id: 6,
      name: "Binance Pay",
      image: method6,
      accountName: "Binance Pay",
      currency: "USD",
      conversionRate: .8,
      accountNumber: "987-654-321",
      branch: "Global Branch",eban:"--"
    }
  ];
  // if (loadingFunds ) {
  //   return (
  //     <div className="loader d-flex" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", backgroundColor: "#1f2937", position: "absolute", top: "0", bottom: "0", left: "0", right: "0" }}>
  //       <Audio height="150" width="150" color="rgb(245, 184, 54)" ariaLabel="loading" />
  //       <img src={logo} alt="" />
  //     </div>
  //   ); // Show loading message
  // }

  return (
    <div style={{overflow:"hidden" }}>
    <Navbar2 funds={funds}  error={error} />
<div className="divider"></div>

<div
        style={{
          backgroundColor: "#fff",
          minHeight: "100vh",
          color: "#000",
        }}
      >
        
        <div dir="auto" className="container">
        <div className="divider"></div>
          <div className="item-1 d-flex">
          
            <div className="num1">1</div>{" "}
            <FontAwesomeIcon
              style={{ margin: "5px 5px 0px" }}
              icon={faWallet}
            />{" "}
            <span>الدفع  </span>
          </div>
          <div className={"methods"}>
            {paymentMethods.map((item) => {
              return (
                <div
                  onClick={() => handleClick(item)}
                  className={`method  ${
                    selectedMethod?.id === item.id ? "active" : ""
                  }`}
                >
                  <div className="image">
                    <img src={item.image} alt="" />
                  </div>
                </div>
              );
            })}
          </div>

        
          <div
            className="row"
            style={{ padding: "0px 10px", marginTop: "15px" }}
          >
            <div className="col-12 " dir="rtl">
            <div className="divider"></div>
              {selectedMethod &&selectedMethod.id !== 6 &&    (
                <>
                  <div className="account-name" >
                    {" "}
                    <div
                      style={{
                        marginBottom: "5px",
                        fontWeight: "400",
                        fontSize: ".9rem",
                      }}
                    >
                      صاحب الحساب
                    </div>
                    <div
                      style={{
                        marginBottom: "10px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                      id="accountname"
                    >
                      {selectedMethod.accountName}
                      <FontAwesomeIcon
                        style={{ marginRight: "5px" }}
                        icon={faCopy} onClick={() => {
                          const accountname = document.getElementById('accountname').innerText;
                          navigator.clipboard.writeText(accountname).then(() => {
                            toast.success("تم النسخ بنجاح!", {
                              position: "top-right",  // تحديد المكان
                              autoClose: 4000,            // تحديد المدة (بالملي ثانية)
                              hideProgressBar: true,      // إخفاء شريط التقدم
                              closeOnClick: true,         // إغلاق الـ Toast عند الضغط عليه
                              pauseOnHover: true,         // إيقاف العد التنازلي عند التمرير
                              draggable: true,    
                                      // جعل الـ Toast قابل للسحب
                              style: {
                                width:"60%",
                                background: "linear-gradient(135deg, #333, #444)",  // تغيير لون الخلفية
                                color: "#ffc107",              // تغيير لون النص
                                borderRadius: "10px",        // إضافة تأثير الزوايا الدائرية
                                padding: "15px",             // تغيير الحشو
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  ,      // تغيير حجم النص
                              }
                            });
                          }).catch((err) => {
                            toast.error("فشل في النسخ!", {
                              
                              position: "top-right",
                              autoClose: 4000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              icon: "🚫",  // هنا نضيف أيقونة مخصصة (مثال: رمز تحذير)
                              style: {
                                width:"60%",
                                backgroundColor: "#000", // لون الخلفية
                                color: "white", // لون النص
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  
                              }
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="account-number">
                    {" "}
                    <div
                      style={{
                        marginBottom: "5px",
                        fontWeight: "400",
                        fontSize: ".9rem",
                      }}
                    >
                     gmail/ رقم الحساب
                    </div>
                    <div
                      style={{
                        marginBottom: "10px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                      id="accountnumber"
                    >
                      {selectedMethod.accountNumber}
                      <FontAwesomeIcon
                        style={{ marginRight: "5px" }}
                        icon={faCopy} onClick={() => {
                          const accountnumber = document.getElementById('accountnumber').innerText;
                          navigator.clipboard.writeText(accountnumber).then(() => {
                            toast.success("تم النسخ بنجاح!", {
                              position: "top-right",  // تحديد المكان
                              autoClose: 4000,            // تحديد المدة (بالملي ثانية)
                              hideProgressBar: true,      // إخفاء شريط التقدم
                              closeOnClick: true,         // إغلاق الـ Toast عند الضغط عليه
                              pauseOnHover: true,         // إيقاف العد التنازلي عند التمرير
                              draggable: true,    
                                      // جعل الـ Toast قابل للسحب
                              style: {
                                width:"60%",
                                background: "linear-gradient(135deg, #333, #444)",  // تغيير لون الخلفية
                                color: "#ffc107",              // تغيير لون النص
                                borderRadius: "10px",        // إضافة تأثير الزوايا الدائرية
                                padding: "15px",             // تغيير الحشو
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  ,      // تغيير حجم النص
                              }
                            });
                          }).catch((err) => {
                            toast.error("فشل في النسخ!", {
                              
                              position: "top-right",
                              autoClose: 4000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              icon: "🚫",  // هنا نضيف أيقونة مخصصة (مثال: رمز تحذير)
                              style: {
                                width:"60%",
                                backgroundColor: "#000", // لون الخلفية
                                color: "white", // لون النص
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  
                              }
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="account-eban">
                    {" "}
                    <div
                      style={{
                        marginBottom: "5px",
                        fontWeight: "400",
                        fontSize: ".9rem",
                      }}
                    >
                      {" "}
                      {selectedMethod.id==4 ?"Binance ID":"رقم الايبان"}
                    </div>
                    <div
                      style={{
                        marginBottom: "10px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                      id="accounteban"
                    >
                      {" "}
                    {selectedMethod.eban}
                      <FontAwesomeIcon
                        style={{ marginRight: "5px" }}
                        icon={faCopy}
                        onClick={() => {
                          const accounteban = document.getElementById('accounteban').innerText;
                          navigator.clipboard.writeText(accounteban).then(() => {
                            toast.success("تم النسخ بنجاح!", {
                              position: "top-right",  // تحديد المكان
                              autoClose: 4000,            // تحديد المدة (بالملي ثانية)
                              hideProgressBar: true,      // إخفاء شريط التقدم
                              closeOnClick: true,         // إغلاق الـ Toast عند الضغط عليه
                              pauseOnHover: true,         // إيقاف العد التنازلي عند التمرير
                              draggable: true,    
                                      // جعل الـ Toast قابل للسحب
                              style: {
                                width:"60%",
                                background: "linear-gradient(135deg, #333, #444)",  // تغيير لون الخلفية
                                color: "#ffc107",              // تغيير لون النص
                                borderRadius: "10px",        // إضافة تأثير الزوايا الدائرية
                                padding: "15px",             // تغيير الحشو
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  ,      // تغيير حجم النص
                              }
                            });
                          }).catch((err) => {
                            toast.error("فشل في النسخ!", {
                              
                              position: "top-right",
                              autoClose: 4000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              icon: "🚫",  // هنا نضيف أيقونة مخصصة (مثال: رمز تحذير)
                              style: {
                                width:"60%",
                                backgroundColor: "#000", // لون الخلفية
                                color: "white", // لون النص
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  
                              }
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="account-branch">
                    {" "}
                    <div
                      style={{
                        marginBottom: "5px",
                        fontWeight: "400",
                        fontSize: ".9rem",
                      }}
                    >
                      {" "}
                      الفرع
                    </div>
                    <div
                      style={{
                        marginBottom: "30px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                      id="accountbranch"
                    >
                      {" "}
                      {selectedMethod.branch}{" "}
                      <FontAwesomeIcon
                        style={{ marginRight: "5px" }}
                        icon={faCopy}
                        onClick={() => {
                          const accountbranch = document.getElementById('accountbranch').innerText;
                          navigator.clipboard.writeText(accountbranch).then(() => {
                            toast.success("تم النسخ بنجاح!", {
                              position: "top-right",  // تحديد المكان
                              autoClose: 4000,            // تحديد المدة (بالملي ثانية)
                              hideProgressBar: true,      // إخفاء شريط التقدم
                              closeOnClick: true,         // إغلاق الـ Toast عند الضغط عليه
                              pauseOnHover: true,         // إيقاف العد التنازلي عند التمرير
                              draggable: true,    
                                      // جعل الـ Toast قابل للسحب
                              style: {
                                width:"60%",
                                background: "linear-gradient(135deg, #333, #444)",  // تغيير لون الخلفية
                                color: "#ffc107",              // تغيير لون النص
                                borderRadius: "10px",        // إضافة تأثير الزوايا الدائرية
                                padding: "15px",             // تغيير الحشو
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  ,      // تغيير حجم النص
                              }
                            });
                          }).catch((err) => {
                            toast.error("فشل في النسخ!", {
                              
                              position: "top-right",
                              autoClose: 4000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              icon: "🚫",  // هنا نضيف أيقونة مخصصة (مثال: رمز تحذير)
                              style: {
                                width:"60%",
                                backgroundColor: "#000", // لون الخلفية
                                color: "white", // لون النص
                                fontSize: "1.3rem"   , 
                                marginTop:"80px"  
                              }
                            });
                          });
                        }}
                      />
                    </div>
                  </div>

               
                </>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              {selectedMethod &&  (
                <>
                  <form
                    style={{
                      margin: "0 auto",
                      textAlign: "center",
                      paddingTop: "0px",
                    }} onSubmit={handleSubmit}
                  >
                    <div style={{ width:"100%",textAlign:'right' }}>
                      <label
                          style={{ width: "60%", marginBottom: "50px", }}
                          className="mt-3"
                          htmlFor="filein"
                        >
                             <input
                    ref={fileInputRef}
                    id="filein"
                    className="mt-3 d-none"
                    type="file"
                    name=""
                    onChange={handleFileChange}
                    accept="image/*" 
                  />
                          {" "}
                        { selectedMethod.id !== 6 && (<Button
                            style={{
                              width: "100%",
                              padding: "2px",
                              backgroundColor: "#a9aab3",
                              border: "none",
                              padding: "8px",
                              color: "#ffc107",
                            }}
                            onClick={() => {
                              fileInputRef.current.click();
                            }}
                            variant="primary"
                          >
                            <FontAwesomeIcon icon={faCloudArrowUp} /> برجاء ارفاق
                            صوره المعامله
                          </Button>)}
                          
                        </label>
                        {imagename&& (<p>تم ارفاق صوره باسم:{imagename}</p>)}
                    </div>
                    <div style={{ margin: "0 auto" ,position:"relative"}} className="details">
                      
                      <input
                        placeholder="ادخل القيمه"
                        className="form-input"
                        value={amount}
                        type="number"
                        onChange={(e) => {handleAmountChange(e.target.value)}}
                        
                      />
<FaCoins style={{ position:'absolute',left:'10px', top:"10px" }} color="#ffc107" size={18}/>
                      <h2 className="amount equal mt-5">
                        {" "}
                        اجمالى الطلب المستحق منك {convertedAmount || 0} {selectedMethod.currency}
                      </h2>
                    </div>
                    <Button
                      style={{
                        width: "95%",
                        padding: "10px",
                        margin: "10px 0px",
                        backgroundColor: "#000",
                        border: "none",
                        color: "#ffc107",
                        fontSize: "1.2rem",
                        borderRadius:"0px 0px 8px 8px"
                      }}
                      type="submit"
                    >
                     {loadingorder ? "جارى المعالجه.......":" اكمال الدفع"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Addcredit;
