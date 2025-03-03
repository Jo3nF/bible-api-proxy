const axios = require('axios');

// Get your API key from environment variables
const API_KEY = process.env.SCRIPTURE_API_BIBLE_KEY;

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug endpoint
  if (req.query.debug === 'true') {
    return res.status(200).json({
      message: 'Bible API Debug Info',
      apiKeyExists: !!API_KEY,
      apiKeyLength: API_KEY ? API_KEY.length : 0,
      query: req.query
    });
  }

  try {
    // Validate API key
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key missing from environment variables' });
    }

    // Get path parameter
    const path = req.query.path || '';
    if (!path) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Parse params if they exist
    let requestParams = {};
    if (req.query.params) {
      try {
        requestParams = JSON.parse(req.query.params);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid params JSON format' });
      }
    }

    console.log('Making request to Scripture API:', path);
    console.log('With params:', requestParams);

    // Make Scripture API request
    const response = await axios({
      method: 'get',
      url: `https://api.scripture.api.bible/v1/${path}`,
      headers: { 'api-key': API_KEY },
      params: requestParams
    });

    // Return the successful response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error details:', error.message);
    console.error('Response data:', error.response?.data);
    
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Bible API request failed',
      details: error.response?.data || {},
      message: error.message
    });
  }
}; 