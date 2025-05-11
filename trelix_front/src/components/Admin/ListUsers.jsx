import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import "./ResponsiveStyle.css";

const fetchUsers = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_PROXY}/api/admin/allUsers`,
    { withCredentials: true }
  );
  return res.data;
};

const ListUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const archiveMutation = useMutation({
    mutationFn: (id) =>
      axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/archiveUser/${id}`,
        null,
        { withCredentials: true }
      ),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id) =>
      axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/unarchiveUser/${id}`,
        null,
        { withCredentials: true }
      ),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const [showArchived, setShowArchived] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showAdmins, setShowAdmins] = useState(true);
  const [showInstructors, setShowInstructors] = useState(true);
  const [showStudents, setShowStudents] = useState(true);
  const [showAll, setShowAll] = useState(true);

  const handleChangeStatus = (event) => {
    setShowArchived(event.target.value === "archived");
  };

  const handleShowAllChange = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    setShowAdmins(newShowAll);
    setShowInstructors(newShowAll);
    setShowStudents(newShowAll);
  };

  const handleIndividualChange = (type) => (event) => {
    const newValue = event.target.checked;
    setShowAdmins(type === "admins" ? newValue : showAdmins);
    setShowInstructors(type === "instructors" ? newValue : showInstructors);
    setShowStudents(type === "students" ? newValue : showStudents);
    setShowAll(newValue && showAdmins && showInstructors && showStudents);
  };

  const sortedFilteredUsers = useMemo(() => {
    if (!users) return [];
    let filtered = users.filter((user) =>
      showArchived ? !user.isActive : user.isActive
    );
    if (!showAdmins) filtered = filtered.filter((u) => u.role !== "admin");
    if (!showInstructors)
      filtered = filtered.filter((u) => u.role !== "instructor");
    if (!showStudents) filtered = filtered.filter((u) => u.role !== "student");
    if (emailSearch)
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(emailSearch.toLowerCase())
      );
    return [...filtered].sort((a, b) => {
      const getValue = (key, obj) => {
        if (key === "fullName")
          return `${obj.firstName} ${obj.lastName}`.toLowerCase();
        if (key === "accountCreatedAt")
          return obj.accountCreatedAt
            ? new Date(obj.accountCreatedAt)
            : new Date(0);
        return obj[key]?.toLowerCase?.() ?? "";
      };
      const valA = getValue(sortBy, a);
      const valB = getValue(sortBy, b);
      return sortOrder === "asc"
        ? valA < valB
          ? -1
          : 1
        : valA > valB
        ? -1
        : 1;
    });
  }, [
    users,
    showArchived,
    showAdmins,
    showInstructors,
    showStudents,
    showAll,
    emailSearch,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(sortedFilteredUsers.length / rowsPerPage);
  const paginatedUsers = sortedFilteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    sortedFilteredUsers,
    showAdmins,
    showInstructors,
    showStudents,
    showAll,
    showArchived,
    emailSearch,
    sortBy,
    sortOrder,
  ]);

  const changeSort = (key) => {
    setSortBy(key);
    setSortOrder((prev) =>
      sortBy === key ? (prev === "asc" ? "desc" : "asc") : "asc"
    );
  };

  const handleUserStatusChange = ({ id, action }) => {
    const isArchiving = action === "archive";

    Swal.fire({
      title: isArchiving ? "Archive User?" : "Unarchive User?",
      text: `Are you sure you want to ${
        isArchiving ? "archive" : "unarchive"
      } this user?`,
      icon: isArchiving ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isArchiving ? "#ffc107" : "#28a745",
      cancelButtonColor: "#aaa",
      confirmButtonText: isArchiving ? "Yes, archive" : "Yes, unarchive",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const mutation = isArchiving ? archiveMutation : unarchiveMutation;
        mutation.mutate(id);
        Swal.fire(
          isArchiving ? "Archived!" : "Unarchived!",
          `User has been ${isArchiving ? "archived" : "unarchived"}.`,
          "success"
        );
      }
    });
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Failed to load users</div>;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Users List</h2>
        <button
          className="custom-btn-create"
          onClick={() => navigate("/admin/create")}
        >
          + Create User
        </button>
      </div>

      <div className="user-filters">
        <FormControl component="fieldset" className="form-control">
          <FormLabel component="legend">User Status</FormLabel>
          <RadioGroup
            row
            value={showArchived ? "archived" : "active"}
            onChange={handleChangeStatus}
          >
            <FormControlLabel
              value="active"
              control={<Radio color="primary" />}
              label="Active Users"
            />
            <FormControlLabel
              value="archived"
              control={<Radio color="primary" />}
              label="Archived Users"
            />
          </RadioGroup>
        </FormControl>

        <input
          type="text"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          placeholder="Search by email"
          className="search-input"
        />

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={showAll}
              onChange={handleShowAllChange}
            />{" "}
            Show All
          </label>
          <label>
            <input
              type="checkbox"
              checked={showAdmins}
              onChange={handleIndividualChange("admins")}
            />{" "}
            Show Admins
          </label>
          <label>
            <input
              type="checkbox"
              checked={showInstructors}
              onChange={handleIndividualChange("instructors")}
            />{" "}
            Show Instructors
          </label>
          <label>
            <input
              type="checkbox"
              checked={showStudents}
              onChange={handleIndividualChange("students")}
            />{" "}
            Show Students
          </label>
        </div>

        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="form-control"
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="desktop-table table-responsive">
        <table className="table custom-table">
          <thead>
            <tr>
              <th onClick={() => changeSort("fullName")}>
                User FullName{" "}
                {sortBy === "fullName" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => changeSort("email")}>
                Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => changeSort("role")}>
                Role {sortBy === "role" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => changeSort("accountCreatedAt")}>
                Created At{" "}
                {sortBy === "accountCreatedAt" &&
                  (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => {
              const isArchived = !user.isActive;
              const isAdmin = user.role === "admin";
              let rowClass = "text-gray-900";
              if (isArchived) rowClass = "bg-gray-100 text-gray-500 italic";
              if (isAdmin) rowClass += " bg-blue-50 font-semibold";
              return (
                <tr key={user._id} className={rowClass}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      {isArchived && (
                        <span className="badge muted">Archived</span>
                      )}
                      {isAdmin && <span className="badge info">Admin</span>}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>
                  <td>
                    {user.accountCreatedAt
                      ? moment(user.accountCreatedAt).format("YYYY-MM-DD HH:mm")
                      : "N/A"}
                  </td>
                  <td className="flex justify-center items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/admin/details/${user._id}`)}
                      className="custom-icon-btn view-btn"
                      title="View User"
                    >
                      <i className="fa fa-eye" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/update/${user._id}`)}
                      className="custom-icon-btn edit-btn"
                      title="Edit User"
                    >
                      <i className="fa fa-pencil" />
                    </button>
                    {!isAdmin &&
                      (isArchived ? (
                        <button
                          onClick={() =>
                            handleUserStatusChange({
                              id: user._id,
                              action: "unarchive",
                            })
                          }
                          className="custom-icon-btn unarchive-btn"
                          title="Unarchive User"
                        >
                          <i className="fa fa-undo" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleUserStatusChange({
                              id: user._id,
                              action: "archive",
                            })
                          }
                          className="custom-icon-btn archive-btn"
                          title="Archive User"
                        >
                          <i className="fa fa-archive" />
                        </button>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards">
        {paginatedUsers.map((user) => (
          <div key={user._id} className="user-card">
            <p className="font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p>{user.email}</p>
            <p className="capitalize">{user.role}</p>
            <p className="text-sm text-gray-500">
              Created:{" "}
              {user.accountCreatedAt
                ? moment(user.accountCreatedAt).format("YYYY-MM-DD")
                : "N/A"}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => navigate(`/admin/details/${user._id}`)}
                className="custom-outline-btn view-btn"
              >
                View
              </button>
              <button
                onClick={() => navigate(`/admin/update/${user._id}`)}
                className="custom-outline-btn edit-btn"
              >
                Edit
              </button>
              {!user.role.includes("admin") &&
                (user.isActive ? (
                  <button
                    onClick={() => handleArchive(user._id)}
                    className="custom-outline-btn archive-btn"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnarchive(user._id)}
                    className="custom-outline-btn unarchive-btn"
                  >
                    Unarchive
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="custom-outline-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className="custom-outline-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListUsers;
