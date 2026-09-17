function computeShipmentStatus(createdAt, eta) {
  if (!eta || !createdAt) return { status: 'En attente', progress: 0 };

  const created  = new Date(createdAt);
  const etaDate  = new Date(eta);
  const now      = new Date();

  // ETA already passed → Livré
  if (now >= etaDate) return { status: 'Livré', progress: 100 };

  const totalMs   = etaDate - created;
  const elapsedMs = now - created;

  if (totalMs <= 0) return { status: 'En attente', progress: 0 };

  let progress = Math.round((elapsedMs / totalMs) * 100);
  progress = Math.max(0, Math.min(99, progress));

  let status;
  if (progress < 20)       status = 'En attente';
  else if (progress < 65)  status = 'En transit';
  else if (progress < 90)  status = 'Dédouanement';
  else                     status = 'En transit';

  return { status, progress };
}

module.exports = { computeShipmentStatus };