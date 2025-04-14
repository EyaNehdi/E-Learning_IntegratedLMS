import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { ref, set, onValue, remove, update } from 'firebase/database';
import '../App.css';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState('');

  // Envoyer un message avec limitation à 10 par minute
  const handleSendMessage = () => {
    const now = Date.now();

    // Récupérer l'historique des timestamps dans localStorage
    const storedTimestamps = JSON.parse(localStorage.getItem("messageTimestamps")) || [];
    const oneMinuteAgo = now - 60000;

    // Ne garder que ceux dans la dernière minute
    const recentTimestamps = storedTimestamps.filter(ts => ts > oneMinuteAgo);

    // Vérifier la limite
    if (recentTimestamps.length >= 10) {
      alert("⛔ Vous avez atteint la limite de 10 messages par minute.");
      return;
    }

    if (message.trim()) {
      const timestamp = now;
      const messageRef = ref(db, 'messages/' + timestamp);
      set(messageRef, {
        text: message,
        timestamp: timestamp,
        edited: false
      });

      // Ajouter ce timestamp et enregistrer dans localStorage
      localStorage.setItem("messageTimestamps", JSON.stringify([...recentTimestamps, now]));

      setMessage('');
    }
  };

  // Supprimer un message
  const handleDeleteMessage = (messageId) => {
    const messageRef = ref(db, 'messages/' + messageId);
    remove(messageRef)
      .then(() => {
        console.log("Message supprimé");
      })
      .catch((error) => {
        console.error("Erreur de suppression :", error);
      });
  };

  // Modifier un message (une seule fois)
  const handleUpdateMessage = (messageId) => {
    if (editedText.trim()) {
      const messageRef = ref(db, 'messages/' + messageId);
      update(messageRef, {
        text: editedText,
        edited: true
      })
        .then(() => {
          console.log("Message modifié");
          setEditingMessage(null);
          setEditedText('');
        })
        .catch((error) => {
          console.error("Erreur de modification :", error);
        });
    }
  };

  // Lire les messages en temps réel
  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      for (const id in data) {
        loadedMessages.push({ id, ...data[id] });
      }
      setMessages(loadedMessages);
    });
  }, []);

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            {msg.edited && <small className="edited-tag">edited</small>}

            <p className="message-text">{msg.text}</p>
            <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>

            <button className="delete-button" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>

            {editingMessage === msg.id ? (
              <>
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="edit-input"
                  placeholder="Modifier le message"
                />
                <button className="update-button" onClick={() => handleUpdateMessage(msg.id)}>Update</button>
              </>
            ) : (
              // Affiche le bouton Edit seulement si le message n'est pas encore édité
              !msg.edited && (
                <button
                  className="edit-button"
                  onClick={() => {
                    setEditingMessage(msg.id);
                    setEditedText(msg.text);
                  }}
                >
                  Edit
                </button>
              )
            )}
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          className="message-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez un message"
        />
        <button className="send-button" onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
}

export default ChatComponent;