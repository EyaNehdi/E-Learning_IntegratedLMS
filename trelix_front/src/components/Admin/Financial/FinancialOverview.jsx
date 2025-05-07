import React from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import Headeradmin from "../Headeradmin";

const FinancialOverview = () => {
  return (
    <div>
      <title>Dashboard Admin</title>
      <Headeradmin />
      <div
        className="page-wrapper"
        style={{
          marginBlock: "2px",
        }}
      >
        <div className="container-fluid">
          <div className="row">
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
                  <Link
                    to="/business-metrics/user-transactions"
                    style={styles.link}
                  >
                    User Transactions
                  </Link>
                </li>
              </ul>
            </div>
            <div style={styles.content}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  link: {
    display: "block",
    padding: "12px 16px",
    color: "#555",
    textDecoration: "none",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    borderLeft: "3px solid transparent",
  },
};

export default FinancialOverview;
