const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Received request:', req.body);

  // Check for API key presence
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('API key missing from environment variables');
    return res.status(500).json({ 
      error: "OpenAI API key is missing from environment variables"
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query from request
    const { query } = req.body || {};
    
    if (!query || typeof query !== 'string') {
      console.error('Missing or invalid query parameter:', req.body);
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    console.log('Processing query:', query);

    // Call OpenAI API using axios instead of the https module
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Bible guidance assistant. Given a question or topic, analyze it and provide relevant Bible verses and spiritual guidance. Format your response as a JSON object with the following structure: { 'verses': [ { 'reference': 'Book Chapter:Verse', 'text': 'Verse text', 'translation': 'Bible translation' } ], 'reflection': 'Your spiritual reflection and guidance based on these verses', 'topics': ['List', 'of', 'related', 'biblical', 'topics'] }"
        },
        { role: "user", content: query }
      ],
      response_format: {
        type: "json_object"
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('OpenAI API response received');
    return res.status(200).json(response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Internal server error';
    
    return res.status(statusCode).json({ error: message });
  }
};