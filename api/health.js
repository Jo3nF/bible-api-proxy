module.exports = (req, res) => {
    // Check for API key presence
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    // Get first few characters of API key if it exists (for security)
    const apiKeyPreview = hasApiKey 
      ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 3)}`
      : 'not found';
    
    res.status(200).json({
      status: "OK",
      service: "Bible API Proxy",
      timestamp: new Date().toISOString(),
      // Debug information
      debug: {
        hasApiKey: hasApiKey,
        apiKeyPreview: apiKeyPreview,
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        envVarCount: Object.keys(process.env).length
      }
    });
  };