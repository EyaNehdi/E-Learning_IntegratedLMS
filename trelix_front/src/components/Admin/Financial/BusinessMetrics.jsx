import axios from "axios";
import React, { useState, useEffect } from "react";

const BusinessMetrics = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topSpenders, setTopSpenders] = useState([]);
  const [avgTimeToFirstPurchase, setAvgTimeToFirstPurchase] = useState(0);

  useEffect(() => {
    fetchBusinessMetrics();
  }, []);

  const fetchBusinessMetrics = async () => {
    try {
      const [avgRes, topSpendersRes, totalRevenueRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_PROXY}/api/finance/avg-time-to-first-purchase`),
        axios.get(`${import.meta.env.VITE_API_PROXY}/api/finance/top-spenders`),
        axios.get(`${import.meta.env.VITE_API_PROXY}/api/finance/total-revenue`),
      ]);

      setAvgTimeToFirstPurchase(avgRes.data.avgDaysToFirstPurchase);
      setTopSpenders(topSpendersRes.data);
      setTotalRevenue(totalRevenueRes.data.totalRevenue);
    } catch (error) {
      console.error("Failed to fetch business metrics:", error);
    }
  };

  return (
    <div style={styles.metrics}>
      <h2>Business Metrics</h2>
      <div style={styles.metric}>
        <h3>Total Revenue</h3>
        <p>${totalRevenue}</p>
      </div>
      <div style={styles.metric}>
        <h3>Top Spenders</h3>
        <ul>
          {topSpenders.map((spender) => (
            <li key={spender.userId}>
              {spender.name}: ${spender.amount}
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.metric}>
        <h3>Average Time to First Purchase</h3>
        <p>{avgTimeToFirstPurchase} days</p>
      </div>
    </div>
  );
};

const styles = {
  metrics: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  metric: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
};

export default BusinessMetrics;
