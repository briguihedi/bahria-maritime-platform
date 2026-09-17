# Groupe BAHRIA — Website (React + Node/Express)

## 📁 Project Structure

```
bahria/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Entry point
│   ├── routes/
│   │   ├── auth.js           # Register / Login / JWT
│   │   ├── contact.js        # Contact form messages
│   │   └── chat.js           # Chatbot responses
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/                 # React + Vite
    ├── index.html
    ├── vite.config.js        # Proxy /api → localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx           # Root: wires all sections
        ├── index.css         # All global styles
        └── components/
            ├── Navbar.jsx    # Fixed navbar + mobile menu
            ├── Hero.jsx      # Hero with animated stats
            ├── Gallery.jsx   # Hover-expand photo strip
            ├── Services.jsx  # 6 service cards
            ├── About.jsx     # Company history + photos
            ├── Group.jsx     # 4 subsidiaries
            ├── CtaBanner.jsx # Full-bleed CTA
            ├── Portal.jsx    # Client portal mockup
            ├── Documents.jsx # 9 document cards
            ├── Contact.jsx   # Form → POST /api/contact
            ├── Footer.jsx    # Full footer
            ├── Chatbot.jsx   # Chat widget → POST /api/chat
            └── AuthModal.jsx # Login/Register → /api/auth
```

---

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (PORT, JWT_SECRET, FRONTEND_URL)
npm run dev        # nodemon — auto-restart on changes
# OR
npm start          # production
```

Server runs at: **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server with HMR
```

Site runs at: **http://localhost:5173**

The Vite proxy automatically forwards `/api/*` → `http://localhost:5000`.

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Path              | Body                                          | Response               |
|--------|-------------------|-----------------------------------------------|------------------------|
| POST   | `/register`       | firstName, lastName, company, email, password | `{ token, user }`      |
| POST   | `/login`          | email, password                               | `{ token, user }`      |
| GET    | `/me`             | Header: `Authorization: Bearer <token>`       | `{ user }`             |

### Contact — `/api/contact`
| Method | Path | Body                                              | Response          |
|--------|------|---------------------------------------------------|-------------------|
| POST   | `/`  | firstName, lastName, email, company, service, message | `{ message }` |

### Chat — `/api/chat`
| Method | Path | Body              | Response        |
|--------|------|-------------------|-----------------|
| POST   | `/`  | message, history  | `{ reply }`     |

---

## 🌐 Sections

| Section        | Description                                      |
|----------------|--------------------------------------------------|
| **Navbar**     | Fixed, scrolled-glass effect, mobile hamburger   |
| **Hero**       | Ken-Burns image, animated counter, 4 stats       |
| **Gallery**    | 5-image hover-expand strip                       |
| **Services**   | 6 cards: Maritime, Customs, Lifting, Storage...  |
| **About**      | History, photos, capital & subsidiaries stats    |
| **Group**      | SMC Bahria, Universal Transit, Schuch, STUMAR    |
| **CTA Banner** | Full-bleed image with call-to-action buttons     |
| **Portal**     | Client dashboard mockup + feature list           |
| **Documents**  | 9 import/export document cards                   |
| **Contact**    | Info + form connected to backend                 |
| **Footer**     | Links, brand, legal                              |
| **Chatbot**    | Floating chat widget connected to backend        |
| **AuthModal**  | Login / Register connected to backend            |

---

## 🔧 Production Build

```bash
# Frontend
cd frontend && npm run build
# Output: frontend/dist/  → serve with Nginx or Express static

# Backend — add in server.js to serve built frontend:
# app.use(express.static(path.join(__dirname, '../frontend/dist')))
```

---

## 🛠️ Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Axios             |
| Styling   | Pure CSS (CSS Variables, no Tailwind) |
| Fonts     | Cormorant Garamond + DM Sans      |
| Backend   | Node.js, Express 4                |
| Auth      | JWT (jsonwebtoken) + bcryptjs     |
| Database  | In-memory (swap for MongoDB/PostgreSQL) |

---

## 📦 Adding a Real Database (MongoDB example)

```bash
cd backend && npm install mongoose
```

```js
// server.js
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
```

Then replace the `users[]` and `messages[]` arrays in the routes with Mongoose models.
