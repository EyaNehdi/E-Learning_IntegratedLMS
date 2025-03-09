import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Module() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [StartDate, setStartDate] = useState("");

  const navigate = useNavigate(); // Hook pour la redirection

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
        navigate("/profile/course"); // Redirection après ajout
      } else {
        alert("Échec de l'ajout du module.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert(error.response?.data?.message || "Échec de l'ajout du module.");
    }
  };

  return (
    <>
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Ajouter un Module</h2>
        <form onSubmit={addModule} className="space-y-6">
          
          {/* Nom du Module */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Nom du module</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="name"
              placeholder="Entrez le nom du module"
              value={name}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              name="description"
              placeholder="Entrez la description"
              value={description}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="3"
            ></textarea>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Date de Création</label>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              name="StartDate"
              value={StartDate}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Bouton de soumission */}
          <button 
            type="submit" 
            className="w-full p-3 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Ajouter Module
          </button>
        </form>
        </>
     
    
  );
}

export default Module;
