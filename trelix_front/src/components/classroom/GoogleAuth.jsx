"use client"

import { useEffect, useState } from "react"
import { getGoogleAuthUrl } from "../../services/googleClassroom.service"

const GoogleAuth = () => {
  const [authUrl, setAuthUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        setLoading(true)
        const { authUrl } = await getGoogleAuthUrl()
        setAuthUrl(authUrl)
      } catch (err) {
        setError("Erreur lors de la récupération de l'URL d'authentification")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthUrl()
  }, [])

  if (loading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="google-auth-container">
      <h2>Connectez-vous à Google Classroom</h2>
      <p>Pour récupérer vos cours Google Classroom, vous devez autoriser l'accès à votre compte Google.</p>
      <button onClick={() => (window.location.href = authUrl)} className="google-auth-button">
        Se connecter avec Google Classroom
      </button>
    </div>
  )
}

export default GoogleAuth

