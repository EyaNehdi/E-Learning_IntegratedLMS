import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../components/css/Animation.css";
const genAI = new GoogleGenerativeAI("AIzaSyDM4K3cIJQx2RvbfAH0ETgzH3g_dcUgssc");

const GeminiChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your assistant. Ask me your questions. 👋"}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        history: messages
          .filter((msg) => msg.sender !== "bot")
          .map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          }))
      });

      const result = await chat.sendMessage(input);
      const response = result.response.text();
      const botMsg = { sender: "bot", text: response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errMsg = { sender: "bot", text: "❌ Erreur : " + (error.message || "inconnue") };
      setMessages((prev) => [...prev, errMsg]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.header}>Gemini - Trelix Assistant</h2>
        <div style={styles.statusIndicator}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>Online</span>
        </div>
      </div>

      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>💬</div>
            <p style={styles.emptyStateText}>Ask me anything to get started!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageContainer,
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.sender === "bot" && (
              <div style={styles.avatarContainer}>
                <div style={styles.avatar}>G</div>
              </div>
            )}

            <div
              style={{
                ...styles.messageBubble,
                backgroundColor: msg.sender === "user" ? "#4361ee" : "#f8f9fa",
                color: msg.sender === "user" ? "#fff" : "#333",
                borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px",
                borderBottomLeftRadius: msg.sender === "user" ? "18px" : "4px",
                boxShadow: msg.sender === "user" ? "0 2px 5px rgba(67, 97, 238, 0.2)" : "0 2px 5px rgba(0, 0, 0, 0.05)",
              }}
            >
              {msg.text}
              <div style={styles.messageTime}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {msg.sender === "user" && (
              <div style={styles.avatarContainer}>
                <div style={{ ...styles.avatar, backgroundColor: "#4361ee" }}>U</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>G</div>
            </div>
            <div style={styles.typingIndicator}>
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
              <span style={styles.typingDot}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
  onClick={handleSend}
  style={{
    ...styles.sendButton,
    opacity: input.trim() === "" ? 0.7 : 1,
    cursor: input.trim() === "" ? "not-allowed" : "pointer",
    fontSize: "20px",         // ✅ Pour bien afficher le ➤
    color: "white",           // ✅ Couleur du texte
    background: "#007bff",    // (Optionnel) Couleur de fond
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
  }}
  disabled={input.trim() === ""}
>
  ➤
</button>

      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>Powered by Gemini AI</span>
      </div>
    </div>
  )
}; 

const styles = {
    container: {
      maxWidth: "800px",
      margin: "30px auto",
      padding: "25px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      backgroundColor: "#ffffff",
      border: "1px solid #f0f0f0",
    },
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: "1px solid #f0f0f0",
    },
    header: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "600",
      color: "#333",
    },
    statusIndicator: {
      display: "flex",
      alignItems: "center",
    },
    statusDot: {
      width: "10px",
      height: "10px",
      backgroundColor: "#4ade80",
      borderRadius: "50%",
      marginRight: "6px",
      boxShadow: "0 0 0 2px rgba(74, 222, 128, 0.2)",
    },
    statusText: {
      fontSize: "14px",
      color: "#4b5563",
    },
    chatBox: {
      borderRadius: "16px",
      padding: "20px",
      backgroundColor: "#f9fafb",
      height: "450px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      scrollBehavior: "smooth",
      border: "1px solid #f0f0f0",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      opacity: 0.7,
    },
    emptyStateIcon: {
      fontSize: "40px",
      marginBottom: "15px",
    },
    emptyStateText: {
      fontSize: "16px",
      color: "#6b7280",
      textAlign: "center",
    },
    messageContainer: {
      display: "flex",
      margin: "8px 0",
      alignItems: "flex-end",
    },
    avatarContainer: {
      width: "36px",
      height: "36px",
      marginRight: "8px",
      marginLeft: "8px",
      flexShrink: 0,
    },
    avatar: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: "#e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4b5563",
      fontWeight: "600",
      fontSize: "14px",
    },
    messageBubble: {
      maxWidth: "70%",
      padding: "12px 16px",
      borderRadius: "18px",
      lineHeight: "1.5",
      wordWrap: "break-word",
      position: "relative",
      fontSize: "15px",
      transition: "all 0.2s ease",
      marginBottom: "4px",
    },
    messageTime: {
      fontSize: "11px",
      opacity: 0.7,
      marginTop: "4px",
      textAlign: "right",
    },
    loadingContainer: {
      display: "flex",
      alignItems: "center",
      margin: "8px 0",
    },
    typingIndicator: {
      display: "flex",
      backgroundColor: "#f8f9fa",
      padding: "12px 16px",
      borderRadius: "18px",
      width: "70px",
      justifyContent: "center",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
    },
    typingDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#9ca3af",
      borderRadius: "50%",
      margin: "0 3px",
      display: "inline-block",
      animation: "typingAnimation 1.4s infinite ease-in-out both",
      animationDelay: "calc(var(--i) * 0.2s)",
    },
    inputContainer: {
      display: "flex",
      marginTop: "20px",
      position: "relative",
    },
    input: {
      flex: 1,
      padding: "16px 20px",
      borderRadius: "30px",
      border: "1px solid #e5e7eb",
      fontSize: "16px",
      backgroundColor: "#f9fafb",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      outline: "none",
    },
    sendButton: {
      marginLeft: "10px",
      backgroundColor: "#4361ee",
      border: "none",
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 10px rgba(67, 97, 238, 0.3)",
    },
    footer: {
      marginTop: "15px",
      textAlign: "center",
    },
    footerText: {
      fontSize: "13px",
      color: "#9ca3af",
    },
    "@keyframes typingAnimation": {
      "0%, 80%, 100%": {
        transform: "scale(0.6)",
      },
      "40%": {
        transform: "scale(1)",
      },
    },
};

export default GeminiChatbot;
