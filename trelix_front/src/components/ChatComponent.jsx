import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig'; // Importer la base de données Firebase
import { ref, set, onValue, remove, update } from 'firebase/database'; // Méthodes Firebase pour manipuler les données
import '../App.css'; // Ajouter le fichier CSS pour styliser ChatComponent

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null); // Pour gérer l'édition des messages
  const [editedText, setEditedText] = useState(''); // Pour le texte modifié

  // Fonction pour envoyer un message dans la base de données
  const handleSendMessage = () => {
    if (message.trim()) {
      const messageRef = ref(db, 'messages/' + Date.now()); // Utiliser un timestamp pour garantir l'unicité des messages
      set(messageRef, {
        text: message,
        timestamp: Date.now()
      });
      setMessage('');  // Réinitialiser le champ de message après l'envoi
    }
  };

  // Fonction pour supprimer un message de la base de données
  const handleDeleteMessage = (messageId) => {
    const messageRef = ref(db, 'messages/' + messageId);
    remove(messageRef)
      .then(() => {
        console.log("Message supprimé avec succès");
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression du message: ", error);
      });
  };

  // Fonction pour mettre à jour un message
  const handleUpdateMessage = (messageId) => {
    if (editedText.trim()) {
      const messageRef = ref(db, 'messages/' + messageId);
      update(messageRef, { text: editedText })
        .then(() => {
          console.log("Message mis à jour avec succès");
          setEditingMessage(null);  // Réinitialiser l'état d'édition
          setEditedText('');  // Réinitialiser le texte édité
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour du message: ", error);
        });
    }
  };

  // Fonction pour lire les messages en temps réel
  useEffect(() => {
    const messagesRef = ref(db, 'messages'); // Référence à la collection de messages
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      for (const id in data) {
        loadedMessages.push({ id, ...data[id] });  // Ajouter l'ID au message
      }
      setMessages(loadedMessages);  // Mettre à jour l'état avec les messages récupérés
    });
  }, []); // Cette fonction s'exécute une seule fois lorsque le composant est monté

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <p className="message-text">{msg.text}</p>
            <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            
            {/* Bouton Delete */}
            <button
              className="delete-button"
              onClick={() => handleDeleteMessage(msg.id)} // Appeler la fonction de suppression
            >
              Delete
            </button>

            {/* Afficher le bouton de mise à jour seulement si l'on est en mode édition */}
            {editingMessage === msg.id ? (
              <>
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)} // Gérer le texte modifié
                  className="edit-input"
                  placeholder="Modifier le message"
                />
                <button
                  className="update-button"
                  onClick={() => handleUpdateMessage(msg.id)} // Appeler la fonction de mise à jour
                >
                  Update
                </button>
              </>
            ) : (
              <button
                className="edit-button"
                onClick={() => { setEditingMessage(msg.id); setEditedText(msg.text); }} // Passer en mode édition
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          className="message-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}  // Mettre à jour le message à chaque frappe
          placeholder="Tapez un message"
        />
        <button className="send-button" onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
}

export default ChatComponent;
