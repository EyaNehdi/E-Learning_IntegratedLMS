import axios from "axios";
import React, { useState, useEffect } from "react";

function Module() {
  const [name, setName] = useState("");

  const addModule = async (e) => {
    e.preventDefault();

    if (!name) {
      alert("Title and description are required.");
      return;
    }
    console.log(name);

    const formData = new FormData();
    formData.append("name", name);

    try {
      const response = await axios.post(
        "http://localhost:5000/module/addmodule",
        {
          name: name,
        }
      );

      if (response.status === 201) {
        alert("Chapter added successfully!");
        setName("");
      } else {
        alert("Failed to add chapter.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Failed to add chapter.");
    }
  };
  return (
    <div>
      <form onSubmit={addModule}>
        <input
          onChange={(e) => setName(e.target.value)}
          type="text"
          name="name"
          id="name"
          value={name}
        />
        <button type="submit" className="btn">
          Add Module
        </button>
      </form>
    </div>
  );
}
export default Module;
