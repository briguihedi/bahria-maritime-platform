const express  = require('express');
const Shipment = require('../models/Shipment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    let shipments;
    if (req.user.role === 'admin') {
      shipments = await Shipment.find().sort({ createdAt: -1 });
    } else {
      shipments = await Shipment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    }

    // Auto-update statuses
    for (const s of shipments) {
      if (s.eta && s.status !== 'Livré') {
        const oldStatus   = s.status;
        const oldProgress = s.progress;
        s.autoUpdateStatus();
        if (s.status !== oldStatus || s.progress !== oldProgress) {
          await s.save();
        }
      }
    }

    res.json({ shipments });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Expédition introuvable.' });
    res.json({ shipment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;