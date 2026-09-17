const express = require('express');
const Quote   = require('../models/Quote');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/quotes — client creates new transit request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { service, origin, destination, cargo, weight, notes, deadline } = req.body;

    // Validation
    if (!service)      return res.status(400).json({ message: 'Le service est requis.' });
    if (!origin)       return res.status(400).json({ message: "Le port d'origine est requis." });
    if (!destination)  return res.status(400).json({ message: 'Le port de destination est requis.' });
    if (!deadline)     return res.status(400).json({ message: 'La date limite est requise.' });

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()))
      return res.status(400).json({ message: 'Date limite invalide.' });
    if (deadlineDate <= new Date())
      return res.status(400).json({ message: 'La date limite doit être dans le futur.' });

    const quote = await Quote.create({
  userId:      req.user.id,
  userEmail:   req.user.email,
  userName:    `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
  userCompany: req.user.company || '',
  service, origin, destination,
  cargo:    cargo    || '',
  weight:   weight   || '',
  notes:    notes    || '',
  deadline,
  status: 'soumis',
});

    res.status(201).json({ message: 'Demande envoyée avec succès.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// GET /api/quotes/mine — client gets all his quotes
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/quotes/:id/confirm — client confirms proposed devis
router.patch('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user.id });
    if (!quote) return res.status(404).json({ message: 'Demande introuvable.' });
    if (quote.status !== 'devis_propose')
      return res.status(400).json({ message: 'Action non autorisée pour ce statut.' });

    quote.status = 'en_cours';
    quote.progress = 5;
    await quote.save();

    res.json({ message: 'Devis confirmé. Votre transit est en cours.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PATCH /api/quotes/:id/cancel — client cancels (any status before en_cours)
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user.id });
    if (!quote) return res.status(404).json({ message: 'Demande introuvable.' });

    const cancellable = ['soumis', 'devis_propose'];
    if (!cancellable.includes(quote.status))
      return res.status(400).json({ message: 'Ce transit ne peut plus être annulé.' });

    quote.status = 'annule';
    await quote.save();

    res.json({ message: 'Transit annulé.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


module.exports = router;