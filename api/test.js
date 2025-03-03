module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Root test function',
    envTest: process.env.SCRIPTURE_API_BIBLE_KEY ? 'API key is set' : 'API key is missing'
  });
}; 