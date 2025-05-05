import axios from "axios"

// Cache for the bad words list
let badWordsCache = null
let lastFetchTime = 0
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

/**
 * Fetches the bad words list from the CSV file
 * @returns {Promise<string[]>} Array of bad words
 */
export const fetchBadWords = async () => {
  const currentTime = Date.now()

  // Return cached list if it exists and hasn't expired
  if (badWordsCache && currentTime - lastFetchTime < CACHE_DURATION) {
    return badWordsCache
  }

  try {
    // Fetch the CSV file
    const response = await axios.get("/data/bad-words.csv")
    const csvContent = response.data


    const lines = csvContent.split("\n")
    const words = lines
      .slice(1) 
      .map((line) => line.trim())
      .filter((line) => line.length > 0) // Remove empty lines

    // Update cache
    badWordsCache = words
    lastFetchTime = currentTime

    return words
  } catch (error) {
    console.error("Error loading bad words list:", error)
 
    return ["fuck", "shit", "ass"]
  }
}

/**
 * Censors bad words in the provided text
 * @param {string} text - The text to censor
 * @returns {Promise<string>} Censored text
 */
export const censorBadWords = async (text) => {
  if (!text) return text

  // Get the bad words list
  const badWords = await fetchBadWords()

  let censoredText = text
  badWords.forEach((word) => {
    // Create a regular expression that matches the word with word boundaries
    // The 'i' flag makes it case-insensitive
    const regex = new RegExp("\\b" + word + "\\b", "gi")

    // Replace the word with asterisks of the same length
    censoredText = censoredText.replace(regex, "*".repeat(word.length))
  })

  return censoredText
}

/**

 * @param {string} text - The text to censor
 * @returns {string} Censored text
 */
export const censorBadWordsSync = (text) => {
  if (!text) return text

  // Use cached bad words or a minimal fallback list
  const badWords = badWordsCache || ["fuck", "shit", "ass"]

  let censoredText = text
  badWords.forEach((word) => {
    const regex = new RegExp("\\b" + word + "\\b", "gi")
    censoredText = censoredText.replace(regex, "*".repeat(word.length))
  })

  return censoredText
}
