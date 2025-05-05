import React, { useState } from 'react';
import axios from 'axios';

const EmotionDetection = () => {
  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmotion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://127.0.0.1:8001/api/emotion');
      setEmotion(response.data.emotion);  // assuming the response contains a field "emotion"
    } catch (err) {
      setError('Error fetching emotion data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Emotion Detection</h1>
      <button onClick={fetchEmotion}>Detect Emotion</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {emotion && <p>Detected Emotion: {emotion}</p>}
    </div>
  );
};

export default EmotionDetection;
