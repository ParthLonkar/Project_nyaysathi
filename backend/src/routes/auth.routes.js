const express = require('express');

const router = express.Router();

router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@nyaysathi.ai',
      role: 'citizen',
    },
  });
});

module.exports = router;
