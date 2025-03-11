import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import Buttons from "./Buttons";
import axios from "axios";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // Stocker les résultats de recherche
  const [query, setQuery] = useState(""); // Capturer la requête de l'utilisateur
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { user, fetchUser, clearUser } = useProfileStore();

  useEffect(() => {
    fetchUser(); // Charger les données utilisateur dès le chargement du composant
  }, [fetchUser]);

  const handleLogout = () => {
    logout(); // Déconnecter l'utilisateur
    clearUser(); // Vider les informations de l'utilisateur
    navigate("/"); // Rediriger vers la page d'accueil
  };

  // Fonction pour gérer la recherche
  const handleSearch = async (query) => {
    if (query.length < 3) {
      setSearchResults([]); // Effacer les résultats si moins de 3 caractères
      return;
    }

    try {
      const response = await axios.get(`/api/courses/search?q=${query}`);
      console.log("Response from API:", response.data); // Vérifiez la structure des données
      setSearchResults(response.data); // Mettre à jour les résultats de la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
    }
  };

  // Fonction de gestion de l'événement de saisie
  const handleInputChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    console.log("Query:", value); // Afficher la valeur de la recherche
    handleSearch(value);
  };

  useEffect(() => {
    console.log("Search Results:", searchResults); // Vérifier les résultats de recherche chaque fois qu'ils changent
  }, [searchResults]); // Cette fonction se déclenchera chaque fois que searchResults change

  return (
    <>
      <header className="header header-1">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo et navigation */}
          <div className="logo">
            <a href="/" className="navbar-brand">Logo</a>
          </div>

          {/* Barre de navigation */}
          <nav className="navbar navbar-expand-lg navbar-light">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="/" className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="/courses" className="nav-link">Courses</a>
              </li>
              <li className="nav-item">
                <a href="/about" className="nav-link">About</a>
              </li>
              <li className="nav-item">
                <a href="/contact" className="nav-link">Contact</a>
              </li>
            </ul>
          </nav>

          {/* Icône de recherche */}
          <div className="search-icon" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-search" aria-controls="offcanvas-search">
            <button type="button" className="btn btn-outline-secondary">🔍</button>
          </div>

          {/* Section de recherche dans le header */}
          <div className="search-popup offcanvas offcanvas-top" id="offcanvas-search" data-bs-scroll="true">
            <div className="container d-flex flex-row py-5 align-items-center position-relative">
              <button
                type="button"
                className="btn-close bg-primary rounded-5"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
              <div className="col-lg-9 mx-auto">
                <form className="search-form w-100 mb-5">
                  <input
                    id="search-form"
                    type="text"
                    className="form-control shadow-1"
                    placeholder="Tapez un mot-clé et appuyez sur entrée"
                    value={query}
                    onChange={handleInputChange} // Appeler handleInputChange à chaque saisie
                  />
                </form>

                {/* Affichage des résultats de recherche */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h6>Résultats de recherche :</h6>
                    <ul>
                      {searchResults.map((course) => (
                        <li key={course._id}>
                          {/* Affichage des détails du cours */}
                          <a href={`/courses/${course._id}`}>{course.title}</a>
                          <p>{course.description}</p>
                          <p>Prix: {course.price}€</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section de menu utilisateur */}
        <div className="user-menu">
          {isAuthenticated ? (
            <div className="user-info">
              <span>{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-primary">Logout</button>
            </div>
          ) : (
            <Buttons />
          )}
        </div>
      </header>
    </>
  );
}

export default Header;