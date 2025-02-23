import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>404</h1>
        <Link to="/" style={styles.link}>Retour à l'accueil</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    backgroundImage: "url('assets/images/404.png')", // chemin vers votre image
    backgroundSize: "cover",    // pour couvrir tout l'écran
    backgroundPosition: "center", // centrer l'image
    backgroundRepeat: "no-repeat",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // optionnel : ajoute un overlay semi-transparent
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "6rem",
    margin: "0 0 20px 0",
  },
  message: {
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  link: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },
};

export default NotFound;
