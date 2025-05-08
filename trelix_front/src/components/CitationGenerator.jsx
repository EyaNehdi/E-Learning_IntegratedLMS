import React, { useState } from 'react';
import axios from 'axios';

const CitationGenerator = () => {
  const [citation, setCitation] = useState('');
  const [author, setAuthor] = useState('');

  const fetchCitation = async () => {
    try {
      // Appel à ton serveur backend local
      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/api/citation`);
      setCitation(response.data.q);
      setAuthor(response.data.a);
    } catch (error) {
      console.error('Erreur lors de la récupération de la citation:', error);
      setCitation('Erreur lors de la récupération de la citation');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Citation Inspirante 📚</h2>
      <button
        onClick={fetchCitation}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Obtenir une citation
      </button>

      {citation && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="italic">"{citation}"</p>
          <p className="text-right">- {author}</p>
        </div>
      )}
    </div>
  );
};

export default CitationGenerator;
