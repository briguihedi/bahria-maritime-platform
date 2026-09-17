require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');


const authRoutes           = require('./routes/auth');
const contactRoutes        = require('./routes/contact');
const chatRoutes           = require('./routes/chat');
const adminRoutes          = require('./routes/admin');
const shipmentsRoutes      = require('./routes/shipments');
const quotesRoutes         = require('./routes/quotes');
const notificationsRoutes  = require('./routes/notifications');
const directMessagesRoutes = require('./routes/directMessages');
const aiRoutes = require('./routes/ai');

const app    = express();
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Connect MongoDB ───────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected → bahria_db'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: isProd ? false : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!isProd) {
  app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/contact',         contactRoutes);
app.use('/api/chat',            chatRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/shipments',       shipmentsRoutes);
app.use('/api/quotes',          quotesRoutes);
app.use('/api/notifications',   notificationsRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

if (isProd) {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Erreur serveur interne.' });
});


app.listen(PORT, () => {
  console.log(`✅  Server → http://localhost:${PORT}  [${isProd ? 'PROD' : 'DEV'}]`);
  console.log(`🔑  Admin: admin@smcbahria.com / admin123`);
});