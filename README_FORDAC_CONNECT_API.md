# 🟢 FORDAC Connect API — Documentation technique (v1.0.0)

**Nom du projet :** FORDAC Connect API  
**Type :** Backend RESTful sécurisé (Node.js + Express + PostgreSQL)  
**Déploiement :** https://api.fordac-connect.org  
**Base de données :** PostgreSQL (hébergée sur Railway)

---

## 🧱 1. Présentation

Le **backend FORDAC Connect** constitue la base technique du système d’adhésion et de gestion du parti **FORDAC (Forces Démocratiques pour l’Action et le Changement)**.

Il gère :
- l’enregistrement des membres et la gestion des niveaux d’adhésion,  
- l’authentification via **JWT**,  
- la consultation et la création d’événements,  
- la messagerie automatique (e-mails de confirmation),  
- la connexion à la base PostgreSQL via un module sécurisé.

---

## ⚙️ 2. Stack technique

| Technologie | Description |
|--------------|-------------|
| **Node.js 22.x** | Environnement serveur moderne |
| **Express.js** | Framework léger pour API REST |
| **PostgreSQL** | Base de données relationnelle |
| **Nodemailer** | Envoi des e-mails d’adhésion |
| **JWT (jsonwebtoken)** | Authentification sécurisée |
| **dotenv** | Gestion des variables d’environnement |
| **CORS** | Accès inter-domaines frontend ↔ backend |
| **Railway** | Hébergement cloud pour API et PostgreSQL |

---

## 📁 3. Structure du projet

```
fordac-api/
├── src/
│   ├── config/
│   │   ├── db.js              → Connexion PostgreSQL
│   │   └── mail.js            → Configuration Nodemailer
│   ├── controllers/
│   │   ├── memberController.js → Gestion des adhésions
│   │   └── eventController.js  → Gestion des événements
│   ├── routes/
│   │   ├── memberRoutes.js    → Routes /api/members
│   │   └── eventRoutes.js     → Routes /api/events
│   ├── middleware/
│   │   └── authMiddleware.js  → Vérification JWT
│   └── server.js              → Point d’entrée Express
│
├── .env.example               → Modèle d’environnement
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔐 4. Variables d’environnement (.env)

Crée un fichier `.env` à la racine du projet :

```
PORT=5001

# Base de données PostgreSQL (Railway)
DB_HOST=maglev.proxy.rlwy.net
DB_PORT=25915
DB_USER=postgres
DB_PASS=wsVFGIJVOuyngBERhIeRYahPThjuzKMq
DB_NAME=railway

# Clé JWT
JWT_SECRET=VFGIJVOuyngBERhIeRYahPThjuzK

# Configuration e-mail
MAIL_USER=apps1pro7@gmail.com
MAIL_PASS=gjct nvzr zdrv tnis
MAIL_FROM="FORDAC Connect info@fordac-connect.org"
MAIL_COORDINATION=adhesions@fordac-connect.org
```

> ⚠️ Ne jamais committer ce fichier `.env` sur GitHub.

---

## 🧩 5. Installation locale

```bash
git clone https://github.com/hdesumo/fordac-api.git
cd fordac-api
npm install
npm run dev
```

Le backend sera accessible sur :  
👉 http://localhost:5001

---

## 🧠 6. Connexion PostgreSQL

La connexion à la base est gérée dans `src/config/db.js`.  
Le module vérifie automatiquement si SSL est nécessaire :

```js
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: false,
});
```

---

## 🔒 7. Authentification

L’API utilise **JWT** pour sécuriser les endpoints membres et événements.  
- Lors du login, un token est généré et renvoyé au client.  
- Ce token est requis pour accéder à certaines routes protégées.

Middleware : `src/middleware/authMiddleware.js`

---

## 📡 8. Endpoints principaux

### 👤 Membres

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/api/members` | Liste des membres |
| `POST` | `/api/members/register` | Enregistrement d’un membre |
| `POST` | `/api/login` | Authentification (JWT) |

### 📅 Événements

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/api/events` | Liste des événements |
| `POST` | `/api/events` | Création d’un événement |

---

## 📬 9. Notifications e-mail

Chaque inscription déclenche un envoi automatique via **Nodemailer** :
- Confirmation d’adhésion au candidat,  
- Notification au secrétariat (`MAIL_COORDINATION`).

---

## 🚀 10. Déploiement

**Plateforme :** Railway  
**Base PostgreSQL :** Railway Database  
**Production :** https://api.fordac-connect.org

Déploiement automatique depuis GitHub :
```bash
git push origin main
```

Railway reconstruit et redémarre le service.

---

## 🧾 11. Auteur & Licence

**Auteur :** Apps 1 Global SA  
**Coordination technique :** Erone Omusoh  
**Licence :** Tous droits réservés — FORDAC Connect © 2025  
**Contact :** info@fordac-connect.org
