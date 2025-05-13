import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CitationGenerator = () => {
  const [citation, setCitation] = useState('');
  const [author, setAuthor] = useState('');
  const [visible, setVisible] = useState(false);

  const fetchCitation = async () => {
    try {
      const response = await axios.get('https://trelix-xj5h.onrender.com/citation/api/quote');
      console.log("response citation front", response.data);
      setCitation(response.data.q);
      setAuthor(response.data.a);
      setVisible(true);

      // Hide citation after 10 seconds
      setTimeout(() => {
        setVisible(false);
      }, 10000);
    } catch (error) {
      console.error('Erreur lors de la récupération de la citation:', error.response?.headers || error.message);
      setCitation('Erreur lors de la récupération de la citation');
      setAuthor('');
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 10000);
    }
  };

  useEffect(() => {
    fetchCitation(); // First fetch on mount

    const intervalId = setInterval(() => {
      fetchCitation();
    }, 900000); // 15 minutes = 900,000 ms

    return () => clearInterval(intervalId);
  }, []);

  return (
    visible && (
      <div className="popup-citation">
        <h2 className="text-2xl font-bold mb-4">Inspiring Quote 📚</h2>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="italic">"{citation}"</p>
          <p className="text-right">- {author}</p>
        </div>
      </div>
    )
  );
};

export default CitationGenerator;
