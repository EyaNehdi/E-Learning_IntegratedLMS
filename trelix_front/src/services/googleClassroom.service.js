import axios from "axios"

const API_URL = "/api/classroom"

// Service pour obtenir l'URL d'authentification Google
export const getGoogleAuthUrl = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/url`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'URL d'authentification:", error)
    throw error
  }
}

// Service pour récupérer tous les cours
export const getAllCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error)
    throw error
  }
}


