const pdfParse = require('pdf-parse');
const axios = require('axios');

// Fonction pour découper un texte trop long en morceaux
const chunkText = (text, maxLength = 1000) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
};

exports.summarizePdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  try {
    // Traitement du fichier PDF directement en mémoire
    const data = await pdfParse(req.file.buffer);
    const pdfText = data.text; // Texte extrait du PDF

    console.log(pdfText); // Vérifier le texte extrait (peut être supprimé après)

    // Découpe du texte si nécessaire (pour éviter que l'API ne rejette un texte trop long)
    const textChunks = chunkText(pdfText);

    // Envoi du texte (en plusieurs morceaux si nécessaire) au modèle Hugging Face pour obtenir le résumé
    const summaries = [];

    for (const chunk of textChunks) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        { inputs: chunk },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Ajout de l'en-tête Accept
          },
        }
      );

      const summary = response.data[0]?.summary_text || "Pas de résumé généré.";
      summaries.push(summary);
    }

    // Fusionner tous les résumés des morceaux, si applicable
    const finalSummary = summaries.join(' ');

    res.json({ summary: finalSummary });

  } catch (error) {
    console.error('Erreur:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erreur lors du traitement du PDF' });
  }
};
