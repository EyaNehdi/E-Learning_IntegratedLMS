import React, { useState } from 'react';
import axios from 'axios';

const Summarizer = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // URL de l'API backend

  const SUMMARIZE_PDF_URL =`${import.meta.env.VITE_API_PROXY}/summarize-pdf/pdf`;

  ;  // Ajoute l'URL directement ici

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Fonction pour envoyer le fichier et récupérer le résumé
  const summarizePdf = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      // Requête POST vers l'API backend pour résumer le PDF
      const response = await axios.post(SUMMARIZE_PDF_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(response.data.summary); // Affichage du résumé reçu
    } catch (error) {
      console.error("Erreur lors du résumé : ", error);
      setSummary("Erreur lors de la génération du résumé.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Summarizer of PDF files 📚</h2>
      <input 
        type="file" 
        accept="application/pdf"
        onChange={handleFileChange}
        className="w-full p-2 border rounded mb-2"
      />
 <button
  onClick={summarizePdf}
  className="bg-blue-500 text-white px-4 py-2 rounded"
  style={{ fontSize: "12px" }}
>
  Summarize Your PDF
</button>

      {loading && <p className="mt-2">loading...</p>}
      {summary && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold">summarize :</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
