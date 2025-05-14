import "./trelix-spinner.css";

const TrelixSpinner = ({ size = "md" }) => {
  const sizeClass =
    size === "sm"
      ? "trelix-spinner-sm"
      : size === "lg"
      ? "trelix-spinner-lg"
      : "";

  return <div className={`trelix-spinner ${sizeClass}`} />;
};

export default TrelixSpinner;
