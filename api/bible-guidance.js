// Using built-in http module
const https = require('https');

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

  // Check for API key presence - IMPORTANT!
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "OpenAI API key is missing from environment variables",
      envVars: Object.keys(process.env).filter(key => !key.includes('TOKEN') && !key.includes('SECRET')).join(', ')
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
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    // Call OpenAI API
    const response = await callOpenAI(query, apiKey);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    
    return res.status(statusCode).json({ error: message });
  }
};

// Function to call OpenAI API
async function callOpenAI(query, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a biblical guidance assistant for a Reina-Valera Spanish Bible app. When the user asks a question or describes a problem, provide 3-5 Bible verses that address their situation. Format your response as a JSON object with a 'verses' array containing objects with 'reference' (e.g., 'Juan 3:16'), 'text' (the verse text in Spanish), and 'reason' (brief explanation in English of why this verse is relevant). Use Spanish verse references."
        },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse OpenAI response'));
          }
        } else {
          try {
            const errorData = JSON.parse(data);
            reject({
              statusCode: res.statusCode,
              message: errorData.error?.message || 'OpenAI API error'
            });
          } catch (e) {
            reject({
              statusCode: res.statusCode,
              message: `OpenAI API error: ${res.statusCode}`
            });
          }
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`));
    });

    req.write(payload);
    req.end();
  });
}