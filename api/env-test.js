module.exports = (req, res) => {
  // List all environment variables (excluding sensitive ones)
  const safeEnvVars = Object.keys(process.env)
    .filter(key => !key.includes('TOKEN') && !key.includes('SECRET') && !key.includes('KEY'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});

  // Check specifically for OpenAI key presence (without revealing it)
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  
  return res.status(200).json({
    environment: process.env.VERCEL_ENV || 'unknown',
    hasOpenAIKey: hasOpenAIKey,
    keyLength: hasOpenAIKey ? process.env.OPENAI_API_KEY.length : 0,
    envVarCount: Object.keys(process.env).length,
    safeEnvVars: safeEnvVars
  });
}; 