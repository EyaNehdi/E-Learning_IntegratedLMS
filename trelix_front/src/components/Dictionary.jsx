"use client"

import { useState } from "react"
import axios from "axios"

// Dictionary component
const DictionaryComponent = () => {
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [loading, setLoading] = useState(false)

  // Fonction pour récupérer la définition du mot
  const fetchDefinition = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
        withCredentials: false,
      })
      setDefinition(res.data[0].meanings[0].definitions[0].definition)
    } catch (err) {
      setDefinition("Definition not found.")
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchDefinition()
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-orange-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-orange-800">Dictionary</h2>
        <span className="text-4xl transform rotate-12 transition-transform hover:rotate-0">📖</span>
      </div>

      {/* Centered search container */}
      <div className="flex flex-col items-center justify-center mb-6 w-full">
        <div className="w-4/5 flex flex-col gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a word..."
            className="w-full px-5 py-4 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-lg shadow-sm text-center"
          />
          <button
            onClick={fetchDefinition}
            disabled={loading || !word.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div
              className="h-3 w-3 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-3 w-3 bg-orange-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      )}

      {/* Affichage de la définition */}
      {definition && !loading && (
        <div className="mt-6 bg-white p-6 rounded-xl border border-orange-200 shadow-md transition-all duration-300 ease-in-out">
          <h3 className="text-xl font-bold text-orange-800 mb-3 border-b border-orange-100 pb-2">
            {word && word.charAt(0).toUpperCase() + word.slice(1)}
          </h3>
          <p className="text-gray-700 leading-relaxed">{definition}</p>
        </div>
      )}

      {/* Empty state */}
      {!definition && !loading && (
        <div className="mt-8 text-center">
          <div className="text-orange-400 text-5xl mb-4">🔍</div>
          <p className="text-orange-700">Enter a word to discover its meaning</p>
        </div>
      )}
    </div>
  )
}

// Page component that includes the Dictionary
const Dictionary = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-r from-orange-50 to-rose-50">
      <DictionaryComponent />
    </main>
  )
}

export default Dictionary