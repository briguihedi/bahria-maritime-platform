const express = require('express');
const Message = require('../models/Message');
const router  = express.Router();

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, company, service, message } = req.body;
    if (!firstName || !email || !message)
      return res.status(400).json({ message: 'Prénom, email et message sont requis.' });

    await Message.create({ firstName, lastName, email, company, service, message });
    res.status(201).json({ message: 'Message envoyé avec succès. Réponse sous 24h.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;