import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CitationGenerator = () => {
  const [citation, setCitation] = useState('');
  const [author, setAuthor] = useState('');
  const [visible, setVisible] = useState(false);

  const fetchCitation = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/api/citation`);

      setCitation(response.data.q);
      setAuthor(response.data.a);
      setVisible(true); // Affiche la citation

      // Cache la citation après 10 secondes
      setTimeout(() => {
        setVisible(false);
      }, 10000);
    } catch (error) {
      console.error('Erreur lors de la récupération de la citation:', error);
      setCitation('Erreur lors de la récupération de la citation');
      setAuthor('');
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 10000);
    }
  };

  // Appel toutes les 20 secondes
  useEffect(() => {
    fetchCitation(); // Premier appel

    const intervalId = setInterval(() => {
      fetchCitation();
    }, 20000); // Toutes les 20 secondes

    return () => clearInterval(intervalId);
  }, []);

  return (
    visible && (
      <div className="popup-citation">
        <h2 className="text-2xl font-bold mb-4">Citation Inspirante 📚</h2>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="italic">"{citation}"</p>
          <p className="text-right">- {author}</p>
        </div>
      </div>
    )
  );
};

export default CitationGenerator;
