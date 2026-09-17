const express      = require('express');
const Notification = require('../models/Notification');
const Shipment     = require('../models/Shipment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const stored = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const shipments = await Shipment.find().limit(4).sort({ createdAt: -1 });

    const auto = shipments.map((s, i) => ({
      _id: `auto-${s._id}`,
      userId: req.user.id,
      type: s.status === 'Livré' ? 'success' : s.status === 'En transit' ? 'info' : 'warning',
      title: `Expédition ${s._id.toString().slice(-6).toUpperCase()}`,
      message: `Statut : ${s.status} — ${s.cargo}`,
      read: i > 1,
      createdAt: s.createdAt,
    }));

    const all = [...stored, ...auto].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ notifications: all, unread: all.filter(n => !n.read).length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ message: 'Toutes les notifications lues.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;