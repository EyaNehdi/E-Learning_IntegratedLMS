const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
     // FastAPI microservice URL
     const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL;

     // Get recommendations for a user
  const recommendUser = async (req, res) => {
    const userId = req.userId; // Use userId from verifyToken middleware
    const topN = req.query.topN || 10;
  
    try {
      const response = await axios.get(`${RECOMMENDATION_SERVICE_URL}/${userId}?top_n=${topN}`);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
     };

     module.exports = {recommendUser};