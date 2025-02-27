module.exports = (req, res) => {
  // Set CORS headers for accessibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Check for API key presence
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  // Get first few characters of API key if it exists (for security)
  const apiKeyPreview = hasApiKey 
    ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 3)}`
    : 'not found';
  
  // Get information about environment
  const envInfo = {
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    hasApiKey: hasApiKey,
    apiKeyPreview: apiKeyPreview,
    envVarCount: Object.keys(process.env).length,
    timestamp: new Date().toISOString(),
    // List some safe environment variables
    safeVars: Object.keys(process.env)
      .filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('TOKEN') && !key.includes('PASSWORD'))
      .slice(0, 10) // Limit to first 10 for readability
  };
  
  return res.status(200).json(envInfo);
};