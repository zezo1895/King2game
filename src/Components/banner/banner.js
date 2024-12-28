import React from "react";
import styles from "./banner.module.css"; // Create this CSS file if necessary
import bannerImage from "./banner.jpg"; // Replace with your banner image path

const Banner = () => {
  return (
    <div className={styles.bannerContainer}>
      <img src={bannerImage} alt="Banner" className={styles.bannerImage} />
    </div>
  );
};

export default Banner;