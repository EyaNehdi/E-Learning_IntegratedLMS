import React, { useState, useEffect } from "react";
import socket from "../../../utils/socket";
import axios from "axios";
import { ArrowDown, ArrowUp, Filter, RefreshCw, Search } from "lucide-react";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, purchase, balance_topup
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

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

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://trelix-xj5h.onrender.com/api/finance/transactions");
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
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
            {type}
          </span>
        );
    }
  };

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

        return (
          userFullName.includes(searchLower) ||
          (transaction.metadata?.courseTitle &&
            transaction.metadata.courseTitle
              .toLowerCase()
              .includes(searchLower))
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

        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
          <Filter size={16} className="text-gray-500 mr-2" />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="bg-transparent outline-none"
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchases</option>
            <option value="balance_topup">Top Ups</option>
          </select>
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
                  Balance Change
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Details
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
                <tr
                  key={transaction._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {transaction.user.firstName} {transaction.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
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
                  <td className="px-4 py-4">
                    {transaction.type === "purchase" &&
                      transaction.metadata?.courseTitle && (
                        <span className="text-sm">
                          {transaction.metadata.courseTitle}
                        </span>
                      )}
                    {transaction.type === "balance_topup" &&
                      transaction.metadata?.stripeSessionId && (
                        <span className="text-xs text-gray-500 break-all">
                          Session ID: {transaction.metadata.stripeSessionId}
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {formatDate(transaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTransactions;
