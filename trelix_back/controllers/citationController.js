const axios = require('axios');

const fetchCitation = async (req, res) => {
  try {
    const response = await axios.get('https://zenquotes.io/api/random');
    const quote = response.data[0]; // Get the first quote from the array

    console.log("citation", quote);

    // Send only what you need
    res.json({
      q: quote.q,
      a: quote.a
    });hn
  } catch (error) {
    console.error('Error fetching quote:', error.message);

    if (error.response && error.response.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    res.status(500).json({ error: 'Failed to fetch quote' });
  }
};

module.exports = { fetchCitation };
