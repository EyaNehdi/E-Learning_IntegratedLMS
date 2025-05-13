import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [format, setFormat] = useState("csv");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isUserInputFocused, setIsUserInputFocused] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/admin/allUsers`
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/finance/transactions`
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async () => {
    try {
      const params = {
        range: dateRange,
        format,
        ...(typeFilter !== "all" && { type: [typeFilter] }),
        ...(selectedUserId && { userId: selectedUserId }),
      };

      const res = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/finance/export`,
        {
          params,
          paramsSerializer: (params) =>
            Object.entries(params)
              .flatMap(([key, val]) =>
                Array.isArray(val)
                  ? val.map((v) => `${key}=${v}`)
                  : `${key}=${val}`
              )
              .join("&"),
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: format === "csv" ? "text/csv" : "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const filtered = transactions
    .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
    .filter((t) => {
      const userName = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
      return userName.includes(search.toLowerCase());
    });

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      signDisplay: "always",
    }).format(amount);
  };

  const isExportValid =
    (typeFilter !== "all" || selectedUserId || dateRange !== "all") &&
    format &&
    (typeFilter !== "all" || dateRange !== "all" || selectedUserId);

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const displayedUsers = showAllUsers
    ? filteredUsers
    : filteredUsers.slice(0, 5);

  return (
    <div className="user-details-container">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-lg font-semibold">User Transactions</h2>
        <button onClick={fetchTransactions} className="custom-outline-btn">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      <div className="filter-export-container">
        {/* FILTER BOX */}
        <div className="filter-box">
          <h3 className="box-title">🔍 Filter Transactions</h3>

          <div className="form-group">
            <label htmlFor="search" className="form-label">
              Search User <span className="form-hint">by full name</span>
            </label>
            <div className="input-custom-icon">
              <Search size={16} />
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Transaction Type
            </label>
            <select
              id="type"
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="balance_topup">Top Up</option>
              <option value="refund">Refund</option>
              <option value="admin_adjustment">Admin Adjustment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="range" className="form-label">
              Date Range
            </label>
            <select
              id="range"
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>
        </div>

        {/* EXPORT BOX */}
        <div className="export-box">
          <h3 className="box-title">📤 Export Options</h3>

          <div className="export-buttons">
            {["csv", "pdf"].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`export-option ${format === f ? "active" : ""}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="form-group user-search-wrapper">
            <label htmlFor="user" className="form-label">
              Select User
            </label>
            <input
              type="text"
              id="user-search"
              className="form-input"
              value={userSearch}
              onFocus={() => setIsUserInputFocused(true)}
              onBlur={() => setTimeout(() => setIsUserInputFocused(false), 150)} // delay to allow click
              onChange={(e) => {
                setUserSearch(e.target.value);
                setShowAllUsers(false);
                setHighlightIndex(0);
              }}
              placeholder="Search user..."
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  setHighlightIndex((prev) =>
                    Math.min(prev + 1, displayedUsers.length - 1)
                  );
                } else if (e.key === "ArrowUp") {
                  setHighlightIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === "Enter") {
                  const selected = displayedUsers[highlightIndex];
                  if (selected) {
                    setSelectedUserId(selected._id);
                    setUserSearch(`${selected.firstName} ${selected.lastName}`);
                  }
                }
              }}
            />

            {isUserInputFocused && (
              <ul className="user-dropdown-list">
                {displayedUsers.map((u, i) => (
                  <li
                    key={u._id}
                    className={`dropdown-item ${
                      i === highlightIndex ? "highlight" : ""
                    }`}
                    onClick={() => {
                      setSelectedUserId(u._id);
                      setUserSearch(`${u.firstName} ${u.lastName}`);
                      setIsUserInputFocused(false);
                    }}
                  >
                    {u.firstName} {u.lastName}
                  </li>
                ))}

                {!showAllUsers && filteredUsers.length > 5 && (
                  <li
                    className="dropdown-item more-option"
                    onClick={() => setShowAllUsers(true)}
                  >
                    + Show all results
                  </li>
                )}

                {filteredUsers.length === 0 && (
                  <li className="dropdown-item text-muted">No users found.</li>
                )}
              </ul>
            )}
          </div>

          <button
            className="export-trigger"
            onClick={handleExport}
            disabled={!isExportValid}
            title={
              !isExportValid
                ? "Please select at least one filter or a user to enable export"
                : "Export transactions"
            }
          >
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : paginated.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th></th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <React.Fragment key={t._id}>
                  <tr>
                    <td>
                      <button
                        onClick={() => toggleRow(t._id)}
                        className="accordion-toggle-icon"
                      >
                        {expandedRows[t._id] ? (
                          <ChevronDown className="accordion-icon" />
                        ) : (
                          <ChevronRight className="accordion-icon" />
                        )}
                      </button>
                    </td>

                    <td>
                      <div className="flex items-center justify-between gap-2">
                        <span>
                          {t.user.firstName} {t.user.lastName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge type-${t.type}`}>
                        {t.type.replace("_", " ")}
                      </span>
                    </td>

                    <td
                      className={
                        t.amount > 0 ? "amount-positive" : "amount-negative"
                      }
                    >
                      {formatCurrency(t.amount)}
                    </td>

                    <td>
                      <div className="text-xs text-gray-600">
                        <div>From: {formatCurrency(t.balanceBefore)}</div>
                        <div>To: {formatCurrency(t.balanceAfter)}</div>
                      </div>
                    </td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}{" "}
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                  {expandedRows[t._id] && (
                    <tr>
                      <td colSpan="6">
                        <div className="bg-gray-50 p-4 rounded text-sm">
                          <h4 className="font-semibold mb-2">
                            Transaction Details
                          </h4>
                          <pre className="overflow-x-auto whitespace-pre-wrap text-xs bg-white p-2 rounded border">
                            {JSON.stringify(t.metadata || {}, null, 2)}
                          </pre>
                          <div className="mt-3 text-right">
                            <button
                              className="custom-outline-btn view-btn"
                              onClick={() =>
                                navigate(`/admin/details/${t.user._id}`)
                              }
                            >
                              View User Details
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <span className="text-sm">
          Page {currentPage} of {Math.ceil(filtered.length / rowsPerPage)}
        </span>
        <div className="flex gap-2">
          <button
            className="custom-outline-btn pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className="custom-outline-btn pagination-btn"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(filtered.length / rowsPerPage))
              )
            }
            disabled={currentPage === Math.ceil(filtered.length / rowsPerPage)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTransactions;
