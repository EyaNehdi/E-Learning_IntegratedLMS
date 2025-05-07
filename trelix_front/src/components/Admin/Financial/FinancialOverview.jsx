import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import Headeradmin from "../Headeradmin";

const FinancialOverview = () => {
  return (
    <div style={styles.dashboard}>
      <div>
        <title>Business Metrics</title>
        <Headeradmin />
      </div>
      <div
        style={{
          width: "250px",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          height: "100vh",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <ul>
          <li>
            <Link to="/business-metrics" style={styles.link}>
              Business Metrics
            </Link>
          </li>
          <li>
            <Link to="/business-metrics/user-transactions" style={styles.link}>
              User Transactions
            </Link>
          </li>
        </ul>
      </div>
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
  content: {
    flex: 1,
    padding: "20px",
  },
  link: {
    display: "block",
    padding: "10px 20px",
    color: "#000",
    textDecoration: "none",
    marginBottom: "10px",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  },
};

export default FinancialOverview;
