# 🛒 E-Market API

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express.js](https://img.shields.io/badge/Express.js-5.1.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8.19.1-brightgreen)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![JWT](https://img.shields.io/badge/JWT-Auth-orange)
![License](https://img.shields.io/badge/license-ISC-blue)

API e-commerce complète avec Express.js et MongoDB. Gestion des produits, catégories et utilisateurs avec authentification JWT et contrôle d'accès basé sur les rôles.

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du Projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Documentation Swagger](#-documentation-swagger)
- [Tests avec Postman](#-tests-avec-postman)
- [Sécurité](#-sécurité)

---

## ✨ Fonctionnalités

### 🔐 Authentification

- ✅ Inscription utilisateur avec validation
- ✅ Connexion avec JWT
- ✅ Hashage des mots de passe (bcrypt)
- ✅ Gestion des rôles (USER / ADMIN)
- ✅ Premier utilisateur devient automatiquement ADMIN

### 🏷️ Gestion des Catégories

- ✅ CRUD complet
- ✅ Système de slug automatique
- ✅ Soft delete
- ✅ Routes publiques (GET) et protégées (POST/PUT/DELETE - Admin only)

### 📦 Gestion des Produits

- ✅ CRUD complet avec validation
- ✅ Relation avec catégories (populate)
- ✅ Gestion du stock
- ✅ Support d'images (URL)
- ✅ Soft delete
- ✅ Routes publiques (GET) et protégées (POST/PUT/DELETE - Admin only)

### 🛡️ Sécurité

- ✅ JWT avec expiration configurable
- ✅ Middleware d'authentification
- ✅ Contrôle d'accès basé sur les rôles
- ✅ Validation des données

### 📚 Documentation

- ✅ Swagger/OpenAPI intégré
- ✅ Interface interactive
- ✅ Exemples de requêtes

---

## 🛠️ Technologies

- **Backend:** Node.js, Express.js
- **Base de données:** MongoDB, Mongoose
- **Cache:** Redis (middleware de cache)
- **Authentification:** JWT (jsonwebtoken), bcryptjs
- **Documentation:** Swagger UI Express, Swagger JSDoc
- **Sécurité:** Helmet, CORS, Rate limiting (express-rate-limit)
- **Logs:** Winston + morgan (rotation fichiers)
- **Validation:** Yup (via `validationMiddleware`)
- **Upload/Images:** Multer, Sharp
- **Outils dev:** Nodemon, Dotenv, Prettier, ESLint

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **MongoDB** (local ou cloud) - [Installation](https://www.mongodb.com/try/download/community)
- **Redis** (cache) - `sudo pacman -S redis` puis `redis-server`
- **Git** - [Télécharger](https://git-scm.com/)
- **Postman** (optionnel, pour tester l'API) - [Télécharger](https://www.postman.com/downloads/)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Ibrahim-Lmlilas/E-Market_API.git
cd E-Market_API
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/emarket

# JWT Configuration
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_EXPIRE=7d
 
# Redis Configuration
REDIS_URL=redis://localhost:6380
```

⚠️ **Important:** Changez `JWT_SECRET` par une valeur unique et sécurisée en production!

### 4. Initialiser les rôles

```bash
npm run setup-roles
```

Cette commande crée les rôles par défaut (USER et ADMIN) dans la base de données.

### 5. Démarrer le serveur

**Mode développement (avec nodemon):**

```bash
npm run dev
```

**Mode production:**

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000` 🚀

---

## 📁 Structure du Projet

```
E-Market_API/
├── config/
│   ├── database.js          # Configuration MongoDB
│   └── swagger.js            # Configuration Swagger
├── controllers/
│   ├── authController.js     # Logique authentification
│   ├── categoryController.js # Logique catégories
│   ├── productController.js  # Logique produits
│   └── userController.js     # Logique utilisateurs
├── middlewares/
│   ├── auth.js              # Protection JWT + vérification rôles
│   ├── errorHandler.js      # Gestion globale des erreurs
│   ├── logger.js            # Journalisation des requêtes
│   ├── notFound.js          # Gestion 404
│   ├── upload.js            # Upload fichiers (Multer)
│   └── validation.js        # Validation des données
├── models/
│   ├── Category.js          # Modèle Mongoose catégories
│   ├── Product.js           # Modèle Mongoose produits
│   ├── Role.js              # Modèle Mongoose rôles
│   └── User.js              # Modèle Mongoose utilisateurs
├── routes/
│   ├── authRoutes.js        # Routes authentification
│   ├── categoryRoutes.js    # Routes catégories
│   ├── productRoutes.js     # Routes produits
│   └── userRoutes.js        # Routes utilisateurs
├── scripts/
│   └── createRoles.js       # Script initialisation rôles
├── services/
│   └── searchService.js     # Service de recherche
├── utils/
│   ├── responseHelper.js    # Helpers réponses HTTP
│   └── validators.js        # Validateurs personnalisés
├── .env                     # Variables d'environnement
├── .gitignore
├── package.json
├── server.js                # Point d'entrée application
└── README.md
```

---

## 🌐 API Endpoints

### 🏠 Base URL

```
http://localhost:3000
```

### 📊 Health Check

```http
GET /health
```

---

### 🔐 Authentication (`/api/auth`)

| Méthode | Endpoint             | Description             | Auth Required |
| ------- | -------------------- | ----------------------- | ------------- |
| POST    | `/api/auth/register` | Créer un nouveau compte | ❌            |
| POST    | `/api/auth/login`    | Se connecter            | ❌            |
| POST    | `/api/auth/logout`   | Se déconnecter          | ✅            |

#### Exemple: Register

```json
POST /api/auth/register
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Exemple: Login

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "670e8b2a1f4c5d6e7f8a9b0c",
    "fullname": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "ADMIN"
    }
  }
}
```

---

### 🏷️ Categories (`/api/categories`)

| Méthode | Endpoint              | Description                 | Auth Required | Admin Only |
| ------- | --------------------- | --------------------------- | ------------- | ---------- |
| GET     | `/api/categories`     | Liste toutes les catégories | ❌            | ❌         |
| GET     | `/api/categories/:id` | Détails d'une catégorie     | ❌            | ❌         |
| POST    | `/api/categories`     | Créer une catégorie         | ✅            | ✅         |
| PUT     | `/api/categories/:id` | Modifier une catégorie      | ✅            | ✅         |
| DELETE  | `/api/categories/:id` | Supprimer une catégorie     | ✅            | ✅         |

#### Exemple: Create Category

```json
POST /api/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Smartphones"
}
```

---

### 📦 Products (`/api/products`)

| Méthode | Endpoint            | Description             | Auth Required | Admin Only |
| ------- | ------------------- | ----------------------- | ------------- | ---------- |
| GET     | `/api/products`     | Liste tous les produits | ❌            | ❌         |
| GET     | `/api/products/:id` | Détails d'un produit    | ❌            | ❌         |
| POST    | `/api/products`     | Créer un produit        | ✅            | ✅         |
| PUT     | `/api/products/:id` | Modifier un produit     | ✅            | ✅         |
| DELETE  | `/api/products/:id` | Supprimer un produit    | ✅            | ✅         |

#### Exemple: Create Product

```json
POST /api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "iPhone 15 Pro",
  "description": "Latest iPhone with A17 Pro chip and titanium design",
  "price": 12999,
  "stock": 50,
  "category": "670e8b2a1f4c5d6e7f8a9b0c",
  "imageUrl": "https://example.com/iphone-15-pro.jpg"
}
```

---

## 📚 Documentation Swagger

Une documentation interactive complète est disponible via Swagger UI.

### Accéder à la documentation

1. Démarrez le serveur: `npm run dev`
2. Ouvrez votre navigateur: `http://localhost:3000/api-docs`

### Fonctionnalités Swagger

- ✅ Documentation complète de tous les endpoints
- ✅ Schémas de données détaillés
- ✅ Exemples de requêtes/réponses
- ✅ Tester directement les endpoints
- ✅ Support de l'authentification JWT

### Utiliser l'authentification dans Swagger

1. Cliquez sur le bouton **"Authorize"** (🔒) en haut à droite
2. Entrez votre token: `Bearer YOUR_JWT_TOKEN`
3. Cliquez sur **"Authorize"**
4. Vous pouvez maintenant tester les routes protégées

---

## ✅ Mise à jour des endpoints (basée sur le code actuel)

Les routes incluent une version interne (`/v1` ou `/v2`) selon la ressource. Combinez avec les préfixes montés dans `server.js`.

### Auth (`/api/auth`)

- POST `/api/auth/v1/register`
- POST `/api/auth/v1/login`
- POST `/api/auth/v1/logout` (auth)

### Categories (`/api/categories`)

- GET `/api/categories/v1`
- GET `/api/categories/v1/:id`
- POST `/api/categories/v1` (auth + admin)
- PUT `/api/categories/v1/:id` (auth + admin)
- DELETE `/api/categories/v1/:id` (auth + admin)

### Products (`/api/products`)

- GET `/api/products/v1` (pagination + filtres: `page`, `limit`, `category`, `search`)
- GET `/api/products/v1/:id`
- GET `/api/products/v1/admin/all` (auth + admin)
- GET `/api/products/v1/my-products` (auth + seller/admin)
- POST `/api/products/v1` (auth + seller/admin, upload image)
- PUT `/api/products/v1/:id` (auth + owner/admin)
- DELETE `/api/products/v1/:id` (auth + owner/admin)
- GET `/api/products/search/:column/:value`

### Profiles (`/api/profiles`)

- GET `/api/profiles/v2/me` (auth)
- PUT `/api/profiles/v2/edit` (auth)
- PUT `/api/profiles/v2/change-password` (auth)

### Role Requests (`/api/request`)

- POST `/api/request/v2/request-role-change` (auth)
- GET `/api/request/v2` (auth + admin)
- POST `/api/request/v2/:id/approve` (auth + admin)
- POST `/api/request/v2/:id/reject` (auth + admin)
- POST `/api/request/v2/:id/change-role` (auth + admin)

### Comments (`/api/comment`)

- GET `/api/comment/v2` (auth + admin)
- GET `/api/comment/v2/product/:productId`
- POST `/api/comment/v2` (auth)
- PUT `/api/comment/v2/:id` (auth)
- DELETE `/api/comment/v2/:id` (auth)
- GET `/api/comment/v2/seller/my-products` (auth + seller)

### Carts (`/api/v2/carts`)

- GET `/api/v2/carts/user/:userId` (auth)
- GET `/api/v2/carts/me` (auth)
- POST `/api/v2/carts/` (auth)
- DELETE `/api/v2/carts/user/:cartId` (auth)
- GET `/api/v2/carts/mycart/items` (auth)
- POST `/api/v2/carts/mycart/items` (auth)
- GET `/api/v2/carts/user/:cartId/items` (auth)
- PUT `/api/v2/carts/user/:cartId/items/:cartItemId` (auth)
- DELETE `/api/v2/carts/user/:cartId/items/:cartItemId` (auth)

### Coupons (`/api/v2/coupons`) [admin]

- GET `/api/v2/coupons/` (auth + admin)
- GET `/api/v2/coupons/:id` (auth + admin)
- POST `/api/v2/coupons/` (auth + admin)
- PUT `/api/v2/coupons/:id` (auth + admin)
- DELETE `/api/v2/coupons/:id` (auth + admin)

### Orders (`/api/v2/orders`)

- GET `/api/v2/orders/` (auth + admin)
- GET `/api/v2/orders/:id` (auth + admin)
- POST `/api/v2/orders/` (auth)
- PUT `/api/v2/orders/:id` (auth + admin)
- DELETE `/api/v2/orders/:id` (auth + admin)

---

## ⚡ Cache & Limitation de débit

- Cache Redis activé pour: catégories, produits, commentaires. Démarrer `redis-server` et définir `REDIS_URL`.
- Limitation de débit par ressource via `middlewares/rateLimiter` (ex.: `/api/auth` plus restrictif).

---

## 🧩 Scripts utiles (complets)

```bash
npm start            # Production
npm run dev          # Développement (nodemon)

# Setup & seed
npm run setup-roles
npm run setup-users
npm run setup-categories
npm run setup-products
npm run setup-all
npm run clear-db

# Qualité & tests
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run format
```

## 🧪 Tests avec Postman

### Configuration Postman

#### 1. Variables d'environnement

Créez un environnement Postman avec ces variables:

| Variable    | Valeur Initiale         | Valeur Courante           |
| ----------- | ----------------------- | ------------------------- |
| `baseUrl`   | `http://localhost:3000` | -                         |
| `authToken` | -                       | (automatique après login) |

#### 2. Workflow de test

**Étape 1: Créer un compte**

```http
POST {{baseUrl}}/api/auth/register
```

**Étape 2: Se connecter**

```http
POST {{baseUrl}}/api/auth/login
```

→ Copiez le `token` de la réponse dans `{{authToken}}`

**Étape 3: Créer une catégorie**

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{authToken}}
```

**Étape 4: Récupérer les catégories**

```http
GET {{baseUrl}}/api/categories
```

→ Copiez un `_id` pour l'utiliser dans les produits

**Étape 5: Créer un produit**

```http
POST {{baseUrl}}/api/products
Authorization: Bearer {{authToken}}

Body: {
  "title": "Product Name",
  "description": "Product description",
  "price": 999,
  "stock": 10,
  "category": "CATEGORY_ID_FROM_STEP_4"
}
```

---

## 🔒 Sécurité

### Authentification JWT

- Token stocké côté client
- Expiration configurable (défaut: 7 jours)
- Format: `Authorization: Bearer <token>`

### Hashage des mots de passe

- Algorithme: bcrypt
- Salt rounds: 10
- Jamais stockés en clair

### Middleware de protection

```javascript
// Routes publiques (pas d'auth)
router.get('/products', productController.getAll);

// Routes authentifiées
router.post('/products', protect, productController.create);

// Routes admin uniquement
router.delete('/products/:id', protect, adminOnly, productController.delete);
```

### Validation des données

- Validation Mongoose au niveau du modèle
- Middleware de validation personnalisé
- Messages d'erreur clairs

---

## 🐛 Résolution de problèmes

### Le serveur ne démarre pas

```bash
# Vérifier que MongoDB est lancé
sudo systemctl status mongod  # Linux
brew services list            # macOS

# Vérifier les variables d'environnement
cat .env
```

### Erreur de connexion MongoDB

```bash
# Vérifier l'URI dans .env
MONGODB_URI=mongodb://localhost:27017/emarket

# Tester la connexion
mongosh mongodb://localhost:27017/emarket
```

### Erreur JWT

```bash
# Vérifier que JWT_SECRET est défini
echo $JWT_SECRET

# Régénérer un token en vous reconnectant
POST /api/auth/login
```

### Postman: "Cannot destructure property"

- ✅ Vérifiez: **Body** → **raw** → **JSON**
- ✅ Vérifiez: **Headers** → `Content-Type: application/json`

---

## 👨‍💻 Développement

### Scripts disponibles

```bash
npm start          # Lancer en production
npm run dev        # Lancer en développement (nodemon)
npm run setup-roles # Initialiser les rôles
```

### Ajouter une nouvelle route

1. Créer le contrôleur dans `controllers/`
2. Créer les routes dans `routes/`
3. Ajouter dans `server.js`: `app.use('/api/...', routes)`
4. Ajouter la documentation Swagger dans les routes

---

## 📝 License

ISC © Ibrahim Lmlilas

---

## 📧 Contact

**Repository:** [https://github.com/Ibrahim-Lmlilas/E-Market_API](https://github.com/Ibrahim-Lmlilas/E-Market_API)

**Issues:** [https://github.com/Ibrahim-Lmlilas/E-Market_API/issues](https://github.com/Ibrahim-Lmlilas/E-Market_API/issues)

---

## 🎉 Remerciements

Projet réalisé dans le cadre du brief **Concepteur Développeur d'Applications**.

---

**Made with ❤️ and Node.js**
