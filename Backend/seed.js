require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Shipment = require('./models/Shipment');
const Task     = require('./models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});
  await Shipment.deleteMany({});
  await Task.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Seed admin
  const admin = await User.create({
    firstName: 'Admin',
    lastName:  'Bahria',
    email:     'admin@smcbahria.com',
    password:  'admin123',
    company:   'Groupe BAHRIA',
    role:      'admin',
    active:    true,
    isVerified: true, 
  });
  console.log('👤 Admin created');

  // Helper — date relative to today
  const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Seed shipments with ETAs that will trigger different auto-statuses
  const shipmentsData = [
    {
      userId:      admin._id,
      clientName:  'TUNISAIR TECHNICS',
      origin:      'Marseille, France',
      destination: 'Sousse, Tunisie',
      cargo:       'Pièces aéronautiques',
      eta:         daysFromNow(6),   // → En transit
    },
    {
      userId:      admin._id,
      clientName:  'STEG',
      origin:      'Rotterdam, Pays-Bas',
      destination: 'Bizerte, Tunisie',
      cargo:       'Équipements électriques',
      eta:         daysFromNow(2),   // → Dédouanement
    },
    {
      userId:      admin._id,
      clientName:  'GROUPE CHIMIQUE',
      origin:      'Hamburg, Allemagne',
      destination: 'Sousse, Tunisie',
      cargo:       'Matières chimiques',
      eta:         daysFromNow(18),  // → En attente
    },
    {
      userId:      admin._id,
      clientName:  'BIAT LEASING',
      origin:      'Gênes, Italie',
      destination: 'Sousse, Tunisie',
      cargo:       'Matériel industriel',
      eta:         daysFromNow(-3),  // → Livré (ETA passée)
    },
  ];

  for (const s of shipmentsData) {
    const shipment = new Shipment(s);
    shipment.autoUpdateStatus(); // ← calcul automatique du statut
    await shipment.save();
  }
  console.log('🚢 Shipments created with auto-status');

  // Seed tasks
  await Task.insertMany([
    { title: 'Préparer dossier douanier BHR-2025-002', priority: 'haute',   status: 'En cours', assignedTo: 'admin', dueDate: daysFromNow(2)  },
    { title: 'Contacter client STEG pour documents',   priority: 'haute',   status: 'À faire',  assignedTo: 'admin', dueDate: daysFromNow(1)  },
    { title: 'Suivi livraison GROUPE CHIMIQUE',        priority: 'normale', status: 'À faire',  assignedTo: 'admin', dueDate: daysFromNow(10) },
    { title: 'Mise à jour tarifs transport Q2 2025',   priority: 'basse',   status: 'Terminé',  assignedTo: 'admin', dueDate: daysFromNow(-5) },
  ]);
  console.log('✅ Tasks created');

  console.log('\n🎉 Seed completed!');
  console.log('📊 Statuts générés automatiquement :');
  console.log('   • TUNISAIR TECHNICS  → ETA dans 6 jours  → 🚢 En transit');
  console.log('   • STEG               → ETA dans 2 jours  → 🏛️  Dédouanement');
  console.log('   • GROUPE CHIMIQUE    → ETA dans 18 jours → ⏳ En attente');
  console.log('   • BIAT LEASING       → ETA passée        → ✅ Livré');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });