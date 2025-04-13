import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Module() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [StartDate, setStartDate] = useState("");

  const navigate = useNavigate();

  const addModule = async (e) => {
    e.preventDefault();

    if (!name || !description || !StartDate) {
      alert("Tous les champs sont requis.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/module/addmodule", {
        name,
        description,
        StartDate,
      });

      if (response.status === 201) {
        alert("Module ajouté avec succès !");
        setName("");
        setDescription("");
        setStartDate("");
        navigate("/profile/course");
      } else {
        alert("Échec de l'ajout du module.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert(error.response?.data?.message || "Échec de l'ajout du module.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Ajouter un Module</h1>
          </div>
        <form onSubmit={addModule} className="space-y-6">
          {/* Nom du Module */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nom du module</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="name"
              placeholder="Entrez le nom du module"
              value={name}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              name="description"
              placeholder="Entrez la description"
              value={description}
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            ></textarea>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date de Création</label>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              name="StartDate"
              value={StartDate}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
          >
            Ajouter Module
          </button>
        </form>
      </div>
    </div>
  );
}

export default Module;
