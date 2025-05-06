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

const fetchUsers = async () => {
  const res = await axios.get("/api/admin/allUsers", { withCredentials: true });
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
      axios.put(`/api/admin/archiveUser/${id}`, null, {
        withCredentials: true,
      }),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id) =>
      axios.put(`/api/admin/unarchiveUser/${id}`, null, {
        withCredentials: true,
      }),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const handleArchive = (id) => {
    Swal.fire({
      title: "Archive User?",
      text: "Are you sure you want to archive this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, archive",
    }).then((result) => {
      if (result.isConfirmed) {
        archiveMutation.mutate(id);
        Swal.fire("Archived!", "User has been archived.", "success");
      }
    });
  };

  const handleUnarchive = (id) => {
    Swal.fire({
      title: "Unarchive User?",
      text: "Are you sure you want to unarchive this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, unarchive",
    }).then((result) => {
      if (result.isConfirmed) {
        unarchiveMutation.mutate(id);
        Swal.fire("Unarchived!", "User has been unarchived.", "success");
      }
    });
  };

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
    const value = event.target.value;
    setShowArchived(value === "archived");
  };

  const handleShowAllChange = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    setShowAdmins(newShowAll);
    setShowInstructors(newShowAll);
    setShowStudents(newShowAll);
  };

  const handleIndividualChange = (type) => {
    return (event) => {
      const newValue = event.target.checked;
      let newShowAdmins = showAdmins;
      let newShowInstructors = showInstructors;
      let newShowStudents = showStudents;

      if (type === "admins") newShowAdmins = newValue;
      if (type === "instructors") newShowInstructors = newValue;
      if (type === "students") newShowStudents = newValue;

      setShowAdmins(newShowAdmins);
      setShowInstructors(newShowInstructors);
      setShowStudents(newShowStudents);

      if (!newShowAdmins || !newShowInstructors || !newShowStudents) {
        setShowAll(false);
      } else {
        setShowAll(true);
      }
    };
  };

  const sortedFilteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((user) =>
      showArchived ? !user.isActive : user.isActive
    );

    if (!showAdmins) {
      filtered = filtered.filter((user) => user.role !== "admin");
    }
    if (!showInstructors) {
      filtered = filtered.filter((user) => user.role !== "instructor");
    }
    if (!showStudents) {
      filtered = filtered.filter((user) => user.role !== "student");
    }

    if (emailSearch) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(emailSearch.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let valA, valB;

      if (sortBy === "fullName") {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortBy === "accountCreatedAt") {
        valA = a.accountCreatedAt ? new Date(a.accountCreatedAt) : new Date(0);
        valB = b.accountCreatedAt ? new Date(b.accountCreatedAt) : new Date(0);
      } else {
        valA = a[sortBy]?.toLowerCase?.() ?? "";
        valB = b[sortBy]?.toLowerCase?.() ?? "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
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
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Failed to load users</div>;

  return (
    <div className="col-xl-9 col-lg-8 col-md-12">
      <div className="card shadow-sm ctm-border-radius">
        <div className="card-body">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <FormControl component="fieldset">
              <FormLabel component="legend">User Status</FormLabel>
              <RadioGroup
                aria-label="user-status"
                name="user-status"
                value={showArchived ? "archived" : "active"} // Manage selected value
                onChange={handleChangeStatus}
                row
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
              className="border p-2 rounded ml-auto"
            />

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={handleShowAllChange}
                />
                Show All
              </label>
              <label className="ml-4">
                <input
                  type="checkbox"
                  checked={showAdmins}
                  onChange={handleIndividualChange("admins")}
                />
                Show Admins
              </label>
              <label className="ml-4">
                <input
                  type="checkbox"
                  checked={showInstructors}
                  onChange={handleIndividualChange("instructors")}
                />
                Show Instructors
              </label>
              <label className="ml-4">
                <input
                  type="checkbox"
                  checked={showStudents}
                  onChange={handleIndividualChange("students")}
                />
                Show Students
              </label>
            </div>

            <select
              className="ml-4 border p-2 rounded"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // reset
              }}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>

          <div
            className="table-responsive"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            <table
              className="table custom-table table-hover"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th
                    onClick={() => changeSort("fullName")}
                    className="cursor-pointer border px-2 py-1"
                  >
                    User FullName{" "}
                    {sortBy === "fullName" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => changeSort("email")}
                    className="cursor-pointer border px-2 py-1"
                  >
                    Email{" "}
                    {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => changeSort("role")}
                    className="cursor-pointer border px-2 py-1"
                  >
                    Role{" "}
                    {sortBy === "role" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => changeSort("accountCreatedAt")}
                    className="cursor-pointer border px-2 py-1"
                  >
                    accountCreatedAt{" "}
                    {sortBy === "accountCreatedAt" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="border px-2 py-1">Actions</th>
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
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-2">
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          {isArchived && (
                            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                              Archived
                            </span>
                          )}
                          {isAdmin && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border px-2 py-1">{user.email}</td>
                      <td className="capitalize border px-2 py-1">
                        {user.role}
                      </td>
                      <td className="border px-2 py-1">
                        {user.accountCreatedAt
                          ? moment(user.accountCreatedAt).format(
                              "YYYY-MM-DD HH:mm"
                            )
                          : "N/A"}{" "}
                      </td>
                      <td className="border px-2 py-1">
                        <span
                          title="View User"
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer mr-2"
                        >
                          <i className="fa fa-eye" />
                        </span>
                        <span
                          title="Edit User"
                          onClick={() => navigate(`/admin/update/${user._id}`)}
                          className="text-green-600 hover:text-green-800 cursor-pointer mr-2"
                        >
                          <i className="fa fa-pencil" />
                        </span>
                        {!isAdmin &&
                          (isArchived ? (
                            <span
                              title="Unarchive User"
                              onClick={() => handleUnarchive(user._id)}
                              className="text-gray-500 hover:text-black cursor-pointer"
                            >
                              <i className="fa fa-undo" />
                            </span>
                          ) : (
                            <span
                              title="Archive User"
                              onClick={() => handleArchive(user._id)}
                              className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                            >
                              <i className="fa fa-archive" />
                            </span>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="min-w-[64px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="min-w-[64px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListUsers;
