const express  = require('express');
const User     = require('../models/User');
const Message  = require('../models/Message');
const Shipment = require('../models/Shipment');
const Quote    = require('../models/Quote');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  next();
}

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalMessages, unreadMessages, totalShipments, activeShipments, totalQuotes, pendingQuotes] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: { $ne: 'admin' }, active: true }),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: { $ne: 'Livré' } }),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'En attente' }),
    ]);
    res.json({ totalUsers, activeUsers, totalMessages, unreadMessages, totalShipments, activeShipments, totalQuotes, pendingQuotes });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/users/:id/toggle
router.patch('/users/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    user.active = !user.active;
    await user.save();
    res.json({ message: `Compte ${user.active ? 'activé' : 'désactivé'}.`, active: user.active });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/admin/messages
router.get('/messages', requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marqué comme lu.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/admin/shipments
router.get('/shipments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });

    // Auto-update each shipment status based on today's date
    const updated = [];
    for (const s of shipments) {
      if (s.eta && s.status !== 'Livré') {
        const oldStatus   = s.status;
        const oldProgress = s.progress;
        s.autoUpdateStatus();
        if (s.status !== oldStatus || s.progress !== oldProgress) {
          await s.save();
        }
      }
      updated.push(s);
    }
    res.json({ shipments: updated });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/admin/shipments
router.post('/shipments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { clientName, origin, destination, status, eta, cargo, userId } = req.body;
    if (!clientName || !origin || !destination)
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });

    const shipment = new Shipment({
      clientName, origin, destination,
      eta:    eta    || '',
      cargo:  cargo  || '',
      userId: userId || null,
      progress: 0,
    });
    // Auto-calculate if ETA provided, else use manual status
    if (eta) {
      shipment.autoUpdateStatus();
    } else {
      shipment.status = status || 'En attente';
    }

    await shipment.save();
    res.status(201).json({ message: 'Expédition créée.', shipment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/shipments/:id
router.patch('/shipments/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shipment) return res.status(404).json({ message: 'Expédition introuvable.' });
    res.json({ message: 'Expédition mise à jour.', shipment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/shipments/:id
router.delete('/shipments/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expédition supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/admin/quotes
router.get('/quotes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/quotes/:id
router.patch('/quotes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quote) return res.status(404).json({ message: 'Devis introuvable.' });
    res.json({ message: 'Devis mis à jour.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
// PATCH /api/admin/quotes/:id/propose — admin proposes devis amount
router.patch('/quotes/:id/propose', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { devisAmount, adminNote } = req.body;
    if (!devisAmount || devisAmount <= 0)
      return res.status(400).json({ message: 'Montant invalide.' });

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: 'devis_propose', devisAmount, adminNote: adminNote || '' },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: 'Demande introuvable.' });
    res.json({ message: 'Devis proposé au client.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/quotes/:id/progress — admin updates progress
router.patch('/quotes/:id/progress', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { progress } = req.body;
    const update = { progress };
    if (progress >= 100) update.status = 'livre';
    else if (progress > 0) update.status = 'en_cours';

    const quote = await Quote.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!quote) return res.status(404).json({ message: 'Demande introuvable.' });
    res.json({ message: 'Progression mise à jour.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/quotes/:id/refuse — admin refuses
router.patch('/quotes/:id/refuse', requireAuth, requireAdmin, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: 'refuse', adminNote: req.body.adminNote || '' },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: 'Demande introuvable.' });
    res.json({ message: 'Transit refusé.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;