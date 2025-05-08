import React, { useState, useEffect } from "react";
import socket from "../../../utils/socket";
import axios from "axios";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Filter, RefreshCw, Search } from "lucide-react";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [expandedRows, setExpandedRows] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    socket.on("financial_event", handleNewTransaction);

    fetchTransactions();
    return () => {
      socket.off("financial_event");
    };
  }, []);

  const handleNewTransaction = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev.slice(0, 49)]);
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
      `"${import.meta.env.VITE_API_PROXY}/api/finance/transactions`
      );
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ArrowUp size={16} />
      ) : (
        <ArrowDown size={16} />
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      signDisplay: "always",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "purchase":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
            Purchase
          </span>
        );
      case "balance_topup":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
            Top Up
          </span>
        );
      case "refund":
        return (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium">
            Refund
          </span>
        );
      case "admin_adjustment":
        return (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
            Admin Adjustment
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
            {type}
          </span>
        );
    }
  };

  const renderDetailContent = (transaction) => {
    switch (transaction.type) {
      case "purchase":
        return (
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Purchase Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Course Title</p>
                <p className="text-sm">
                  {transaction.metadata?.courseTitle || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Course ID</p>
                <p className="text-sm">{transaction.relatedObject || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Model</p>
                <p className="text-sm">{transaction.relatedModel || "N/A"}</p>
              </div>
            </div>
          </div>
        );

      case "balance_topup":
        return (
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Top Up Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Stripe Session ID</p>
                <p className="text-sm break-all">
                  {transaction.metadata?.stripeSessionId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Product ID</p>
                <p className="text-sm">{transaction.relatedObject || "N/A"}</p>
              </div>
            </div>
          </div>
        );

      case "refund":
        return (
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Refund Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Original Purchase</p>
                <p className="text-sm">
                  {transaction.metadata?.originalPurchaseId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm">
                  {transaction.metadata?.reason || "N/A"}
                </p>
              </div>
            </div>
          </div>
        );

      case "admin_adjustment":
        return (
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">
              Admin Adjustment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Admin User</p>
                <p className="text-sm">
                  {transaction.metadata?.adminUser || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm">
                  {transaction.metadata?.reason || "N/A"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-2">Additional Details</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(transaction.metadata || {}, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Apply filtering and sorting to transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      // Apply type filter
      if (filter !== "all" && transaction.type !== filter) return false;

      // Apply search term
      if (searchTerm) {
        const userFullName =
          `${transaction.user.firstName} ${transaction.user.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Expanded search to include various metadata fields
        const hasMatchingCourseTitle =
          transaction.metadata?.courseTitle &&
          transaction.metadata.courseTitle.toLowerCase().includes(searchLower);

        const hasMatchingStripeId =
          transaction.metadata?.stripeSessionId &&
          transaction.metadata.stripeSessionId
            .toLowerCase()
            .includes(searchLower);

        const hasMatchingReason =
          transaction.metadata?.reason &&
          transaction.metadata.reason.toLowerCase().includes(searchLower);

        return (
          userFullName.includes(searchLower) ||
          hasMatchingCourseTitle ||
          hasMatchingStripeId ||
          hasMatchingReason
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortConfig.key === "user") {
        const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
        const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <title>User Transactions</title>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Financial Transactions
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 flex-grow md:flex-grow-0 w-full md:w-auto">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name or course..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-transparent outline-none flex-grow"
          />
        </div>

        {/* Custom dropdown to replace the select element */}
        <div className="relative">
          <button
            className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2 w-40"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <span>
                {filter === "all"
                  ? "All Types"
                  : filter === "purchase"
                  ? "Purchases"
                  : filter === "balance_topup"
                  ? "Top Ups"
                  : filter === "refund"
                  ? "Refunds"
                  : filter === "admin_adjustment"
                  ? "Admin Adjustments"
                  : "All Types"}
              </span>
            </div>
            <ChevronDown size={16} className="ml-2" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg py-1">
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filter === "all" ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setFilter("all");
                  setDropdownOpen(false);
                }}
              >
                All Types
              </button>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filter === "purchase" ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setFilter("purchase");
                  setDropdownOpen(false);
                }}
              >
                Purchases
              </button>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filter === "balance_topup" ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setFilter("balance_topup");
                  setDropdownOpen(false);
                }}
              >
                Top Ups
              </button>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filter === "refund" ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setFilter("refund");
                  setDropdownOpen(false);
                }}
              >
                Refunds
              </button>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  filter === "admin_adjustment" ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setFilter("admin_adjustment");
                  setDropdownOpen(false);
                }}
              >
                Admin Adjustments
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th
                  className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("user")}
                >
                  <div className="flex items-center">
                    <span>User</span>
                    <span className="ml-1">{getSortIndicator("user")}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("amount")}
                >
                  <div className="flex items-center">
                    <span>Amount</span>
                    <span className="ml-1">{getSortIndicator("amount")}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th
                  className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    <span className="ml-1">
                      {getSortIndicator("createdAt")}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <React.Fragment key={transaction._id}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${
                      expandedRows[transaction._id] ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleRowExpansion(transaction._id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {expandedRows[transaction._id] ? (
                          <ChevronDown size={16} className="text-gray-600" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.user.firstName}{" "}
                          {transaction.user.lastName}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {transaction.user._id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getTypeLabel(transaction.type)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          transaction.amount > 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">
                          From: {formatCurrency(transaction.balanceBefore)}
                        </span>
                        <span className="text-xs text-gray-500">
                          To: {formatCurrency(transaction.balanceAfter)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                  {expandedRows[transaction._id] && (
                    <tr>
                      <td colSpan={6} className="p-0 border-t-0">
                        {renderDetailContent(transaction)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTransactions;
