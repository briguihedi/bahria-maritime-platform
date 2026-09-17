const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const User       = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Email transporter ──────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, firstName, token) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from:    `"Groupe BAHRIA" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: 'Vérification de votre compte — Groupe BAHRIA',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#070E1C;font-family:Arial,sans-serif">
        <div style="max-width:560px;margin:40px auto;background:#0A1628;border:1px solid rgba(201,168,76,.25);border-radius:20px;overflow:hidden">
          <div style="padding:32px;text-align:center;border-bottom:1px solid rgba(201,168,76,.15);background:rgba(201,168,76,.05)">
            <div style="font-size:28px;margin-bottom:8px">⚓</div>
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#C9A84C;letter-spacing:3px">GROUPE BAHRIA</div>
            <div style="font-size:10px;color:#8899AA;letter-spacing:2px;margin-top:4px">TRANSPORT MARITIME & LOGISTIQUE</div>
          </div>
          <div style="padding:40px 36px">
            <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px">Bonjour ${firstName} 👋</h2>
            <p style="color:#8899AA;font-size:15px;line-height:1.7;margin:0 0 28px">
              Merci de vous être inscrit sur la plateforme Groupe BAHRIA.<br>
              Pour activer votre compte et accéder à votre espace client, veuillez confirmer votre adresse email.
            </p>
            <div style="text-align:center;margin:32px 0">
              <a href="${link}"
                style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#C9A84C,#E2C47A);color:#070E1C;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;letter-spacing:.5px">
                ✓ Vérifier mon email
              </a>
            </div>
            <p style="color:#5F6B7A;font-size:12px;line-height:1.7;margin:24px 0 0;text-align:center">
              Ce lien expire dans <strong style="color:#C9A84C">24 heures</strong>.<br>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
          <div style="padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,.04)">
            <p style="color:#3A4A5A;font-size:11px;margin:0">© ${new Date().getFullYear()} Groupe BAHRIA — Sousse, Tunisie</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, company } = req.body;

    console.log('Register attempt:', { firstName, email });

    if (!firstName || !email || !password)
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email déjà utilisé.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log('Creating user...');

    const user = await User.create({
      firstName,
      lastName:          lastName  || '',
      email,
      password,
      company:           company   || '',
      isVerified:        false,
      verificationToken,
    });

    console.log('User created:', user._id);
    console.log('Verification link:', `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`);

    // Send email
    try {
      await sendVerificationEmail(email, firstName, verificationToken);
      console.log('Verification email sent to:', email);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: `Compte créé ! Un email de vérification a été envoyé à ${email}.`,
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    console.error('REGISTER ERROR FULL:', err);
    res.status(500).json({ message: err.message || 'Erreur serveur.' });
  }
});

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token manquant.' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Lien invalide ou expiré.' });

    user.isVerified        = true;
    user.verificationToken = null;
    await user.save();

    console.log('Email verified for:', user.email);

    res.json({ message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    console.error('VERIFY ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    if (!user.isVerified)
      return res.status(403).json({
        message:     'Compte non vérifié. Veuillez vérifier votre email avant de vous connecter.',
        notVerified: true,
      });

    if (!user.active)
      return res.status(403).json({ message: "Compte désactivé. Contactez l'administrateur." });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        company:   user.company,
        role:      user.role,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ── GET ME ────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ user });
  } catch (err) {
    console.error('GET ME ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, company, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    if (firstName)            user.firstName = firstName;
    if (lastName  !== undefined) user.lastName  = lastName;
    if (company   !== undefined) user.company   = company;
    if (newPassword)          user.password  = newPassword;

    await user.save();
    res.json({
      message: 'Profil mis à jour.',
      user: {
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        company:   user.company,
      },
    });
  } catch (err) {
    console.error('PROFILE ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });

    const resetToken   = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 1000 * 60 * 60; // 1 heure

    user.resetPasswordToken   = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('Reset password link:', link);

    try {
      await transporter.sendMail({
        from:    '"Groupe BAHRIA" <noreply@smcbahria.com>',
        to:      email,
        subject: 'Réinitialisation de votre mot de passe — Groupe BAHRIA',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#070E1C;font-family:Arial,sans-serif">
            <div style="max-width:560px;margin:40px auto;background:#0A1628;border:1px solid rgba(201,168,76,.25);border-radius:20px;overflow:hidden">
              <div style="padding:32px;text-align:center;border-bottom:1px solid rgba(201,168,76,.15);background:rgba(201,168,76,.05)">
                <div style="font-size:28px;margin-bottom:8px">⚓</div>
                <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#C9A84C;letter-spacing:3px">GROUPE BAHRIA</div>
                <div style="font-size:10px;color:#8899AA;letter-spacing:2px;margin-top:4px">TRANSPORT MARITIME & LOGISTIQUE</div>
              </div>
              <div style="padding:40px 36px">
                <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px">Réinitialisation du mot de passe</h2>
                <p style="color:#8899AA;font-size:15px;line-height:1.7;margin:0 0 28px">
                  Vous avez demandé la réinitialisation de votre mot de passe.<br>
                  Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                </p>
                <div style="text-align:center;margin:32px 0">
                  <a href="${link}"
                    style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#C9A84C,#E2C47A);color:#070E1C;font-weight:700;font-size:16px;border-radius:12px;text-decoration:none;letter-spacing:.5px">
                    🔑 Réinitialiser mon mot de passe
                  </a>
                </div>
                <p style="color:#5F6B7A;font-size:12px;line-height:1.7;margin:24px 0 0;text-align:center">
                  Ce lien expire dans <strong style="color:#C9A84C">1 heure</strong>.<br>
                  Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
              </div>
              <div style="padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,.04)">
                <p style="color:#3A4A5A;font-size:11px;margin:0">© ${new Date().getFullYear()} Groupe BAHRIA — Sousse, Tunisie</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('Reset email sent to:', email);
    } catch (emailErr) {
      console.error('Reset email error:', emailErr.message);
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: 'Token et mot de passe requis.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Mot de passe : 6 caractères minimum.' });

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Lien invalide ou expiré.' });

    user.password             = password;
    user.resetPasswordToken   = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log('Password reset for:', user.email);
    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;