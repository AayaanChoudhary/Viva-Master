const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { runAgent } = require('../ai/agent');

// @route   POST /api/ai/chat
// @desc    Interact with the AI File Assistant
// @access  Private
router.post('/chat', protect, async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const result = await runAgent(query, req.user._id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error in AI Agent');
  }
});

module.exports = router;
