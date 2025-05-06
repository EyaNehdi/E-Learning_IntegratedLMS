const pdfParse = require('pdf-parse');
const axios = require('axios');

exports.summarizePdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  try {
    // Traitement du fichier PDF directement en mémoire
    const data = await pdfParse(req.file.buffer);
    const pdfText = data.text; // Texte extrait du PDF

    // Envoi du texte au modèle Hugging Face pour obtenir le résumé
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: pdfText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data[0]?.summary_text || "Pas de résumé généré.";
    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du traitement du PDF' });
  }
};
