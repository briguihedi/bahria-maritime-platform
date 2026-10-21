# 🚢 Groupe BAHRIA — Plateforme Web Maritime & Logistique

<div align="center">

![Groupe BAHRIA](https://img.shields.io/badge/Groupe-BAHRIA-C9A84C?style=for-the-badge&logo=anchor&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq-AI_LLaMA-F55036?style=for-the-badge&logo=meta&logoColor=white)

**Plateforme Full-Stack de gestion maritime, logistique et douanière avec IA Générative intégrée.**

*Projet de Fin d'Études — Licence Génie Logiciel & Systèmes d'Information — ISIMM 2026*

</div>

---

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Démarrage Rapide](#-démarrage-rapide)
- [Structure du Projet](#-structure-du-projet)
- [API REST](#-api-rest)
- [Module IA](#-module-ia)
- [Comptes de Test](#-comptes-de-test)
- [Variables d'Environnement](#-variables-denvironnement)

---

## 🌟 Aperçu

La plateforme **Groupe BAHRIA** est une application web complète développée pour **SMC Bahria**, entreprise tunisienne spécialisée dans le transport maritime et la logistique à Sousse.

Elle digitalise et centralise :
- La gestion des **transits et expéditions maritimes**
- Le **suivi en temps réel** des cargaisons
- L'**analyse documentaire** par IA (OCR)
- La **conformité douanière** automatisée par IA Générative
- La communication entre **clients et équipe Bahria**

---

## ✨ Fonctionnalités

### 🌐 Site Public
| Fonctionnalité | Description |
|---|---|
| Présentation des 6 services | Transport Maritime, Dédouanement, Manutention, Stockage, Transport Terrestre, Acconage |
| Modal "En savoir plus" | Détails complets, processus, avantages, documents requis par service |
| Formulaire de contact | Sauvegardé en MongoDB |
| Chatbot intelligent | Réponses automatiques FR/EN |
| Internationalisation | Français / Anglais complet (i18next) |

### 👤 Espace Client (`/dashboard`)
| Fonctionnalité | Description |
|---|---|
| Suivi Expéditions | Progression en temps réel, statut auto-calculé depuis ETA |
| Gestion Transits | Soumettre, suivre, confirmer ou décliner des devis |
| Messagerie | Chat direct avec l'équipe Bahria |
| Notifications | Alertes en temps réel avec badge non-lu |
| Assistant IA | OCR documentaire + analyse conformité douanière |
| Profil | Modification des informations personnelles |

### ⚙️ Panel Administrateur (`/admin`)
| Fonctionnalité | Description |
|---|---|
| Tableau de bord | KPIs globaux en temps réel |
| Gestion Utilisateurs | Activer / Désactiver / Supprimer |
| Gestion Transits | Proposer devis, suivre progression, marquer livré |
| Gestion Expéditions | CRUD complet avec assignation client |
| Calendrier | Planning mensuel avec ETAs automatiques |
| Messagerie | Vue globale de toutes les conversations |

### 🔐 Authentification & Sécurité
- **JWT** (7 jours) — authentification stateless
- **Vérification email** obligatoire à l'inscription (lien cryptographique 24h)
- **Réinitialisation mot de passe** par email (lien sécurisé 1h)
- **bcrypt** (12 rounds) — hashage des mots de passe
- **Route Guards** — protection `/admin` et `/dashboard` par rôle

---

## 🛠 Stack Technique

### Frontend
```
React 18 + Vite          — Framework UI et build tool
react-router-dom v6      — Routing SPA
axios                    — Client HTTP avec intercepteur JWT
i18next                  — Internationalisation FR/EN
lucide-react             — Icônes SVG (strokeWidth 1.5)
```

### Backend
```
Node.js + Express.js     — Serveur REST API
MongoDB + Mongoose       — Base de données NoSQL + ODM
jsonwebtoken             — Authentification JWT
bcryptjs                 — Hashage des mots de passe
nodemailer               — Envoi d'emails (vérification, reset)
multer                   — Upload de fichiers (OCR)
groq-sdk                 — Interface IA Générative
```

### Intelligence Artificielle
```
meta-llama/llama-4-scout-17b-16e-instruct  — OCR et extraction documentaire
llama-3.3-70b-versatile                    — Analyse conformité douanière
```
> Modèles LLaMA de Meta, accessibles via l'API **Groq** (inférence ultra-rapide).

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│         COUCHE PRÉSENTATION             │
│   React 18 + Vite (SPA)                 │
│   3 espaces : Public / Client / Admin   │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (JSON)
                   │ Authorization: Bearer <JWT>
┌──────────────────▼──────────────────────┐
│         COUCHE MÉTIER                   │
│   Node.js + Express.js                  │
│   22+ endpoints REST                    │
│   Groq SDK (IA Générative)              │
│   Nodemailer (emails transactionnels)   │
└──────────────────┬──────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────┐
│         COUCHE DONNÉES                  │
│   MongoDB — bahria_db                   │
│   7 collections                         │
│   users / quotes / shipments /          │
│   messages / directmessages /           │
│   notifications / tasks                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js v18+
- MongoDB (local ou Atlas)
- Compte Groq API (gratuit)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/bahria-platform.git
cd bahria-platform
```

### 2. Configurer le Backend
```bash
cd Backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs
npm run dev
```
> Serveur disponible sur **http://localhost:5000**

### 3. Initialiser la base de données
```bash
node seed.js
```
> Crée le compte admin + 4 expéditions de démonstration

### 4. Lancer le Frontend
```bash
cd ../frontend
npm install
npm run dev
```
> Application disponible sur **http://localhost:5173**

---

## 📁 Structure du Projet

```
Bahria_group_Project/
│
├── Backend/
│   ├── models/
│   │   ├── User.js              # isVerified, resetPasswordToken
│   │   ├── Quote.js             # Workflow transit (7 statuts)
│   │   ├── Shipment.js          # autoUpdateStatus() depuis ETA
│   │   ├── Message.js           # Formulaires contact
│   │   ├── DirectMessage.js     # Messagerie interne
│   │   ├── Notification.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js              # register, verify-email, login, forgot/reset-password
│   │   ├── contact.js
│   │   ├── shipments.js
│   │   ├── quotes.js
│   │   ├── notifications.js
│   │   ├── directMessages.js
│   │   ├── admin.js
│   │   └── ai.js                # OCR + conformité douanière
│   ├── middleware/
│   │   ├── auth.js              # requireAuth, requireAdmin
│   │   └── upload.js            # multer config
│   ├── uploads/
│   ├── server.js
│   ├── seed.js
│   └── .env
│
└── frontend/
    ├── public/
    │   └── Logo principale.png
    └── src/
        ├── pages/
        │   ├── Homepage.jsx
        │   ├── AdminDashboard.jsx
        │   ├── ClientDashboard.jsx
        │   ├── VerifyEmail.jsx
        │   └── ResetPassword.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Hero.jsx
        │   ├── Services.jsx
        │   ├── ServiceModal.jsx
        │   ├── About.jsx
        │   ├── Group.jsx
        │   ├── Contact.jsx
        │   ├── AuthModal.jsx
        │   ├── AIAssistant.jsx
        │   ├── AdminCalendar.jsx
        │   └── ...
        ├── context/AuthContext.jsx
        ├── hooks/useScrollAnimation.js
        ├── utils/api.js
        ├── data/servicesData.js
        └── i18n/
            ├── fr.json
            └── en.json
```

---

## 📡 API REST

### Authentification — `/api/auth`
| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/register` | Public | Inscription + email de vérification |
| GET | `/verify-email?token=` | Public | Activation du compte |
| POST | `/login` | Public | Connexion + JWT |
| GET | `/me` | Authentifié | Profil courant |
| PATCH | `/profile` | Authentifié | Modifier profil / mot de passe |
| POST | `/forgot-password` | Public | Envoi lien de réinitialisation |
| POST | `/reset-password` | Public | Nouveau mot de passe via token |

### Client — `/api`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/shipments` | Expéditions du client |
| POST | `/quotes` | Soumettre un transit |
| GET | `/quotes/mine` | Mes transits |
| PATCH | `/quotes/:id/confirm` | Confirmer un devis |
| PATCH | `/quotes/:id/cancel` | Annuler un transit |
| GET | `/notifications` | Mes notifications |
| GET/POST | `/direct-messages/mine` | Messagerie |

### Administration — `/api/admin`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/stats` | KPIs globaux |
| GET/DELETE/PATCH | `/users/:id` | Gestion utilisateurs |
| GET/POST/PATCH/DELETE | `/shipments` | CRUD expéditions |
| GET | `/quotes` | Tous les transits |
| PATCH | `/quotes/:id/propose` | Proposer un devis |
| PATCH | `/quotes/:id/refuse` | Refuser avec raison |
| PATCH | `/quotes/:id/progress` | Progression 1-100% |

### IA — `/api/ai`
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/ocr` | Analyse documentaire (multipart) |
| POST | `/compliance` | Conformité douanière |

---

## 🤖 Module IA

### OCR — Analyse Documentaire
Analyse visuelle de documents maritimes (Bill of Lading, Factures, Certificats...) et extraction automatique des champs structurés.

```
Modèle  : meta-llama/llama-4-scout-17b-16e-instruct
Provider: Groq API
Input   : Image (JPG/PNG) ou PDF — Max 10MB
Output  : JSON structuré (expéditeur, destinataire, ports, cargo, dates...)
```

### Conformité Douanière
Analyse réglementaire complète à partir de la description d'une marchandise.

```
Modèle  : llama-3.3-70b-versatile
Provider: Groq API
Input   : description, origine, destination, valeur USD
Output  : Code SH, niveau de risque, documents requis,
          droits & taxes, alertes, recommandations,
          accords commerciaux applicables
```

---

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| **Admin** | admin@smcbahria.com | admin123 | `/admin` |
| **Client** | Créer un compte | libre | `/dashboard` |

> Le compte admin est créé automatiquement via `node seed.js` avec `isVerified: true`.

---

## ⚙️ Variables d'Environnement

Créer un fichier `.env` dans `Backend/` :

```env
# Serveur
PORT=5000
FRONTEND_URL=http://localhost:5173

# Base de données
MONGO_URI=mongodb://localhost:27017/bahria_db

# Authentification
JWT_SECRET=your_super_secret_key_here

# Intelligence Artificielle
GROQ_API_KEY=gsk_your_groq_api_key

# Email (Mailtrap pour dev / Gmail pour prod)
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
```

---

## 🎨 Design System

```
Couleurs
  Navy Deep  #070E1C   Fond principal
  Gold       #C9A84C   Accent principal
  Teal       #0BB4B0   Accent secondaire

Typographie
  Display    Cormorant Garamond
  Body       Inter

Icônes      Lucide React (outline, strokeWidth 1.5)
```

---

## 📊 Workflow Transit

```
Client soumet une demande     →  statut : soumis
Admin propose un montant      →  statut : devis_propose
Client valide                 →  statut : en_cours (5%)
Admin met à jour (slider)     →  statut : en_cours (1-99%)
Admin marque livré            →  statut : livre (100%)

Client décline                →  statut : annule
Admin refuse (avec raison)    →  statut : refuse
```

---

## 📄 Licence

Ce projet a été développé dans le cadre d'un **Projet de Fin d'Études** à l'[ISIMM](https://www.isimm.rnu.tn) — Institut Supérieur d'Informatique et de Mathématiques de Monastir, Tunisie.

**Entreprise d'accueil :** SMC Bahria — Groupe BAHRIA, Sousse, Tunisie.

---

<div align="center">

Développé par **Mohamed Hedi Brigui** — ISIMM 2026

</div>
