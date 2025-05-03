import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./WordleGame.css";

function WordleGame() {
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost
  const [message, setMessage] = useState("");
  const [customWord, setCustomWord] = useState("");
  const [showCustomWordInput, setShowCustomWordInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shake, setShake] = useState(false);
  
  const MAX_ATTEMPTS = 6;
  
  // Keyboard layout
  const keyboard = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"]
  ];

  // Fetch a random word from the API
  const fetchRandomWord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/wordle/word");
      setWord(response.data.word.toLowerCase());
      resetGame(response.data.word.toLowerCase());
    } catch (error) {
      console.error("Error fetching word:", error);
      setMessage("Failed to fetch a word. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize the game
  useEffect(() => {
    fetchRandomWord();
  }, [fetchRandomWord]);

  // Reset the game state
  const resetGame = (newWord = "") => {
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setMessage("");
    if (newWord) setWord(newWord);
  };

  // Set a custom word
  const handleSetCustomWord = () => {
    if (customWord.length !== 5) {
      setMessage("Custom word must be exactly 5 letters");
      return;
    }
    
    if (!/^[a-zA-Z]+$/.test(customWord)) {
      setMessage("Custom word must contain only letters");
      return;
    }
    
    resetGame(customWord.toLowerCase());
    setCustomWord("");
    setShowCustomWordInput(false);
    setMessage("Custom word set! Start guessing.");
  };

  // Handle keyboard input
  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== "playing") return;
    
    if (key === "Enter") {
      if (currentGuess.length !== 5) {
        setMessage("Word must be 5 letters");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      
      // Check if the player won
      if (currentGuess === word) {
        setGameStatus("won");
        setMessage("You won! 🎉");
      } 
      // Check if the player lost
      else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameStatus("lost");
        setMessage(`Game over! The word was: ${word}`);
      }
    } 
    else if (key === "Backspace") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } 
    else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key);
    }
  }, [currentGuess, guesses, gameStatus, word]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleKeyPress("Enter");
      } else if (e.key === "Backspace") {
        handleKeyPress("Backspace");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress]);

  // Get letter status (correct, present, absent)
  const getLetterStatus = (letter, index, guess) => {
    if (guess[index] === word[index]) {
      return "correct";
    } else if (word.includes(guess[index])) {
      return "present";
    } else {
      return "absent";
    }
  };

  // Get keyboard key status
  const getKeyStatus = (key) => {
    if (key === "Enter" || key === "Backspace") return "";
    
    let status = "";
    
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      for (let j = 0; j < guess.length; j++) {
        if (guess[j] === key) {
          const letterStatus = getLetterStatus(key, j, guess);
          if (letterStatus === "correct") return "correct";
          if (letterStatus === "present" && status !== "correct") status = "present";
          if (letterStatus === "absent" && status === "") status = "absent";
        }
      }
    }
    
    return status;
  };

  return (
    <div className="wordle-container">
      <div className="wordle-header">
        <h1>Wordle Game</h1>
        <div className="wordle-controls">
          <button onClick={fetchRandomWord} style={{
      paddingLeft: "16px", // Increased padding for more width
      paddingRight: "16px",
      minWidth: "120px", // Ensures the button is wide enough
      whiteSpace: "nowrap", // Prevents text wrapping
      backgroundColor: "green",
    }}
           >
            New Game
          </button>
          <button 
            onClick={() => setShowCustomWordInput(!showCustomWordInput)} 
            style={{
              paddingLeft: "20px", // Increased padding for more width
              paddingRight: "20px",
              minWidth: "180px", // Ensures the button is wide enough
              whiteSpace: "nowrap", // Prevents text wrapping
              backgroundColor: "green",
            }}
          >
            {showCustomWordInput ? "Cancel" : "Set Custom Word"}
          </button>
        </div>
      </div>
      
      {showCustomWordInput && (
        <div className="custom-word-container">
          <input
            type="text"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value.toLowerCase())}
            maxLength={5}
            placeholder="Enter a 5-letter word"
            className="custom-word-input"
          />
          <button onClick={handleSetCustomWord} className="wordle-button">
            Set Word
          </button>
        </div>
      )}
      
      {message && <div className="wordle-message">{message}</div>}
      
      <div className="wordle-board">
        {/* Previous guesses */}
        {guesses.map((guess, i) => (
          <div key={i} className="wordle-row">
            {guess.split("").map((letter, j) => (
              <div 
                key={j} 
                className={`wordle-tile ${getLetterStatus(letter, j, guess)}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
        
        {/* Current guess */}
        {gameStatus === "playing" && (
          <div className={`wordle-row ${shake ? "shake" : ""}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="wordle-tile">
                {currentGuess[i] || ""}
              </div>
            ))}
          </div>
        )}
        
        {/* Empty rows */}
        {gameStatus === "playing" && 
          Array.from({ length: MAX_ATTEMPTS - guesses.length - 1 }).map((_, i) => (
            <div key={i} className="wordle-row">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="wordle-tile"></div>
              ))}
            </div>
          ))
        }
      </div>
      
      {/* Virtual keyboard */}
      <div className="wordle-keyboard">
        {keyboard.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`keyboard-key ${getKeyStatus(key)} ${
                  key === "Enter" || key === "Backspace" ? "keyboard-key-wide" : ""
                }`}
                disabled={gameStatus !== "playing"}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordleGame;