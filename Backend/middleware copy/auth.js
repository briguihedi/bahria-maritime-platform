const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bahria_secret_key_2024';

/**
 * Protect a route — requires a valid Bearer token.
 * On success, attaches req.user = { id, email }
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expirée. Veuillez vous reconnecter.'
      : 'Token invalide.';
    return res.status(401).json({ message: msg });
  }
}

module.exports = { requireAuth };
