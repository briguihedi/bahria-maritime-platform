const express = require('express');
const router = express.Router();

const BAHRIA_CONTEXT = `Tu es Bahria, l'assistant virtuel intelligent du Groupe BAHRIA (SMC Bahria), société maritime et logistique tunisienne fondée en 2004 par M. Farhat Belgacem.
INFOS: Adresse: Zone Industrielle Sidi Abdelhamid, 4061 Sousse | Tél: +216 73 322 518 / +216 73 322 778 | Email: commercial@smcbahria.com
FILIALES: SMC Bahria (agence maritime, transit, acconage, magasin sous douane) | Universal Transit (commissionnaire en douane, SINDA/TTN) | Bahria Schuch Maintenance (levage/grues, partenariat allemand 2008) | STUMAR (acconage port de Bizerte)
SERVICES: Transport maritime | Consignation navires | Magasin cale sous douane (2 magasins, 6 mois max) | Commissionnaire en douane | Manutention levage | Transport terrestre multimodal (propres camions SCANIA + SNCFT ferroviaire)
DOCUMENTS: Facture commerciale | DDM | Certificat d'origine | Certificat de circulation | Certificat sanitaire | B/L (seul document négociable) | Manifeste | DAE | SINDA | TTN
Réponds en français. Sois professionnel, concis et utile.`;

function getMockResponse(text) {
  const tl = text.toLowerCase();

  if (tl.includes('service') || tl.includes('offr')) {
    return "Le Groupe BAHRIA propose :\n• Transport maritime international et local\n• Consignation de navires\n• Magasin cale sous douane (2 magasins)\n• Commissionnaire en douane (Universal Transit)\n• Manutention et levage (Bahria Schuch)\n• Transport terrestre multimodal\n\nQuel service vous intéresse ?";
  }
  if (tl.includes('douane') || tl.includes('document') || tl.includes('import')) {
    return "Pour une importation en Tunisie :\n\n📄 Facture commerciale\n📄 Connaissance maritime (B/L)\n📄 DDM (Déclaration en Détail)\n📄 Certificat d'origine\n📄 DAE (Autorisation d'enlèvement)\n📄 Certificat sanitaire\n\nNotre filiale Universal Transit gère tout cela via SINDA et TTN !";
  }
  if (tl.includes('adresse') || tl.includes('contact') || tl.includes('téléphone') || tl.includes('telephone') || tl.includes('où') || tl.includes('ou')) {
    return "📍 Zone Industrielle Sidi Abdelhamid\n4061 Sousse, Tunisie\n\n📞 +216 73 322 518\n📞 +216 73 322 778\n✉️ commercial@smcbahria.com\n\n🕐 Lun–Ven : 8h00–17h00\n🚨 Urgences : 24h/24";
  }
  if (tl.includes('bizerte') || tl.includes('stumar')) {
    return "Notre filiale STUMAR est concessionnaire au port de Bizerte. Elle assure :\n• Chargement et déchargement de navires\n• Tous types de marchandises (vrac, sacherie, général cargo, colis lourds)\n• Livraison terrestre jusqu'aux dépôts\n\nContactez-nous pour vos opérations portuaires !";
  }
  if (tl.includes('levage') || tl.includes('grue')) {
    return "Bahria Schuch Maintenance (partenariat germano-tunisien depuis 2008) propose :\n• Location de grues terrestres\n• Manutention de charges lourdes\n• Domaines : logistique, industriel, pétrolier\n\nContactez commercial@smcbahria.com pour un devis.";
  }
  if (tl.includes('prix') || tl.includes('tarif') || tl.includes('devis')) {
    return "Nos tarifs sont personnalisés selon vos besoins.\n\nPour un devis rapide :\n📧 commercial@smcbahria.com\n📞 +216 73 322 518\n\nOu utilisez le formulaire de contact sur cette page. Réponse sous 24h !";
  }
  if (tl.includes('transit') || tl.includes('universal')) {
    return "Universal Transit est notre filiale spécialisée en dédouanement :\n• Import et export\n• Systèmes SINDA et TTN\n• Procédures rapides et conformes\n\nTout votre dossier douanier géré de A à Z !";
  }
  if (tl.includes('transport') || tl.includes('camion') || tl.includes('ferrovi') || tl.includes('sncft')) {
    return "Notre flotte de transport terrestre comprend :\n• Camions SCANIA (transport routier)\n• Partenariat SNCFT (transport ferroviaire)\n\nSolution multimodale complète pour vos marchandises !";
  }

  return "Merci pour votre question ! Je peux vous informer sur nos services, procédures douanières, filiales ou coordonnées.\n\nPour toute demande spécifique :\n📧 commercial@smcbahria.com\n📞 +216 73 322 518";
}

// POST /api/chat
router.post('/', (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message requis.' });
    }

    // Simulate slight processing delay (handled on frontend)
    const reply = getMockResponse(message);

    res.json({
      reply,
      context: BAHRIA_CONTEXT.substring(0, 50) + '...',
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

module.exports = router;
