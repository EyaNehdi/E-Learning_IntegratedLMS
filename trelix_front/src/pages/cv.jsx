import React, { useState } from 'react';
import axios from 'axios';
import './CV.css'; // Make sure to import your CSS file

function CV() {
  const [cvFile, setCvFile] = useState(null);
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State for error messages

  const handleFileChange = (event) => {
    setCvFile(event.target.files[0]);
    setError(null); // Reset error on file change
  };

  const handleSubmit = async () => {
    const file = cvFile;
    if (!file) return;

    const formData = new FormData();
    formData.append('cvFile', file); // Use the raw file from the input

    setIsLoading(true); // Start loading
    setError(null); // Reset error message

    try {
      const response = await axios.post(
        'http://localhost:5000/ia/auth/CV',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data' // Add this header
          },
          timeout: 30000
        }
      );
      console.log('Response:', response.data);
      setEntities(response.data.entities);
    } catch (error) {
      setError(error.response?.data?.error || error.message); // Capture error message
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };

  return (
    <div className="cv-container">
      <h1>CV Analysis</h1>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={!cvFile || isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>} {/* Display error messages */}
      <div className="entities-container">
        <h2>Named Entities:</h2>
        {entities.length > 0 ? (
          entities.map((ent, index) => (
            <div className="profile-card" key={index}>
              <h3>{ent.label}</h3>
              <p>{ent.text}</p>
            </div>
          ))
        ) : (
          <p>No entities found.</p>
        )}
      </div>
    </div>
  );
}

export default CV;
