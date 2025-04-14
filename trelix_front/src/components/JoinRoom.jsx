import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function JoinRoom() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  // Fonction pour rejoindre une réunion
  const handleJoin = () => {
    if (room.trim()) {
      navigate(`/meeting/${room.trim()}`);  // Redirige vers la salle de réunion
    } else {
      alert("Veuillez entrer un ID de salle.");
    }
  };

  // Fonction pour créer une réunion aléatoire
  const handleCreate = async () => {
    try {
      console.log("Demande de création de salle...");
      // Assure-toi que l'URL ici pointe vers le bon port backend
      const res = await axios.post("http://localhost:5000/createRoom");  // Backend à localhost:5000
      console.log("Réponse du serveur :", res.data);  // Log de la réponse pour vérifier le contenu
  
      const roomName = res.data.roomName;  // Récupérer le nom de la salle
  
      if (roomName) {
        navigate(`/meeting/${roomName}`);  // Rediriger vers la nouvelle réunion
      } else {
        alert("Erreur lors de la création de la salle.");
      }
    } catch (err) {
      console.error("Erreur de création de salle:", err);  // Log de l'erreur
      alert("Impossible de créer une salle.");
    }
  };
  
  
  
  

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 80px)", // Enlever l'espace occupé par le header et footer (80px ici pour exemple)
        padding: "2rem",
        fontFamily: "'Arial', sans-serif", // Police moderne
        backgroundColor: "#f7f7f7",  // Fond plus clair
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Ombre légère
          maxWidth: "600px",  // Augmenter la largeur de la boîte
          width: "100%", // S'adapte à la taille de l'écran
          backgroundColor: "white", // Fond blanc pour la boîte
        }}
      >
        <h2 style={{ color: "#343a40", fontWeight: "bold" }}>Bienvenue dans la plateforme de réunion !</h2>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Entrer un ID de salle"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              padding: "12px 15px",
              width: "100%", // L'input occupe toute la largeur de la boîte
              maxWidth: "400px", // Limiter la largeur à 400px
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginRight: "15px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              transition: "0.3s ease-in-out",
            }}
          />
          <button
            onClick={handleJoin}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              transition: "0.3s ease-in-out",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              width: "150px",  // Largeur plus grande pour le bouton
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"} // Couleur au survol
            onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"} // Retour à la couleur initiale
          >
            Rejoindre
          </button>
        </div>

       
      </div>
    </div>
  );
};
