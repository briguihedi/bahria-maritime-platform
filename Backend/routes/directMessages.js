const express       = require('express');
const DirectMessage = require('../models/DirectMessage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/direct-messages/mine
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const messages = await DirectMessage.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/direct-messages/mine
router.post('/mine', requireAuth, async (req, res) => {
  try {
    const { content, subject } = req.body;
    if (!content) return res.status(400).json({ message: 'Message requis.' });

    const msg = await DirectMessage.create({
      userId:    req.user.id,
      userEmail: req.user.email,
      userName:  `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      content,
      subject:   subject || 'Question générale',
      from:      'client',
    });

    // Auto-reply
    await DirectMessage.create({
      userId:    req.user.id,
      userEmail: req.user.email,
      userName:  'Équipe Bahria',
      content:   "Merci pour votre message ! Un membre de notre équipe vous répondra dans les meilleurs délais.\n\n📞 Pour les urgences : +216 73 322 518\n✉️ commercial@smcbahria.com",
      subject:   subject || 'Question générale',
      from:      'team',
      read:      true,
    });

    res.status(201).json({ message: 'Message envoyé.', msg });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/direct-messages/all  (admin)
router.get('/all', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Accès refusé.' });
    const messages = await DirectMessage.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;