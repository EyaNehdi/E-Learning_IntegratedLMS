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
        minHeight: "calc(100vh - 80px)",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        backgroundImage: "linear-gradient(to bottom right, #f8f9fa, #e9ecef)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              textAlign: "center",
              margin: "0 0 0.5rem",
              color: "#333",
            }}
          >
            Join a Meeting
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#6c757d",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Enter a room ID to join the meet
          </p>
        </div>

        <div style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
          <div style={{ marginBottom: "1.25rem", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6c757d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <input
                type="text"
                placeholder="Enter room ID"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  outline: "none",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                  height: "48px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4dabf7"
                  e.target.style.boxShadow = "0 0 0 3px rgba(77, 171, 247, 0.25)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#dee2e6"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>
            {!room && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6c757d",
                  margin: "0.5rem 0 0 0.25rem",
                }}
              >
                Room ID can be any combination of letters and numbers
              </p>
            )}
          </div>

          <button
            onClick={handleJoin}
            disabled={!room.trim()}
            style={{
              width: "100%",
              height: "48px",
              backgroundColor: room.trim() ? "#4dabf7" : "#a5d8ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "500",
              cursor: room.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease-in-out",
              padding: "0.75rem 1rem",
            }}
            onMouseEnter={(e) => {
              if (room.trim()) {
                e.target.style.backgroundColor = "#339af0"
              }
            }}
            onMouseLeave={(e) => {
              if (room.trim()) {
                e.target.style.backgroundColor = "#4dabf7"
              }
            }}
          >
            Join Meeting
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: "0.5rem" }}
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
};
