# 🧪 Tests E-Market API

Ce dossier contient tous les tests unitaires et d'intégration pour l'API E-Market.

## 📁 Structure des Tests

```
test/
├── auth.test.js          # Tests d'authentification
├── category.test.js      # Tests des catégories
├── product.test.js       # Tests des produits
├── cart.test.js          # Tests du panier
├── user.test.js          # Tests des utilisateurs
├── health.test.js        # Tests de santé et routes de base
├── basic.test.js         # Tests basiques existants
├── setup.js              # Configuration des tests
└── README.md             # Documentation des tests
```

## 🚀 Exécution des Tests

### Installation des dépendances

```bash
npm install
```

### Exécuter tous les tests

```bash
npm test
```

### Exécuter les tests en mode watch

```bash
npm run test:watch
```

### Exécuter un test spécifique

```bash
npx mocha test/auth.test.js
```

## 📊 Couverture des Tests

### ✅ Tests Implémentés

1. **Authentification (`auth.test.js`)**
   - ✅ Inscription utilisateur
   - ✅ Connexion utilisateur
   - ✅ Déconnexion utilisateur
   - ✅ Validation des données
   - ✅ Gestion des erreurs

2. **Catégories (`category.test.js`)**
   - ✅ Liste des catégories (public)
   - ✅ Détails d'une catégorie
   - ✅ Création de catégorie (admin)
   - ✅ Modification de catégorie (admin)
   - ✅ Suppression de catégorie (admin)
   - ✅ Gestion des permissions

3. **Produits (`product.test.js`)**
   - ✅ Liste des produits (public)
   - ✅ Détails d'un produit
   - ✅ Création de produit (admin)
   - ✅ Modification de produit (admin)
   - ✅ Suppression de produit (admin)
   - ✅ Validation des données produit

4. **Panier (`cart.test.js`)**
   - ✅ Récupération du panier
   - ✅ Ajout d'articles au panier
   - ✅ Modification des quantités
   - ✅ Suppression d'articles
   - ✅ Vidage du panier

5. **Utilisateurs (`user.test.js`)**
   - ✅ Profil utilisateur
   - ✅ Modification du profil
   - ✅ Changement de mot de passe
   - ✅ Suppression de compte

6. **Santé et Routes de Base (`health.test.js`)**
   - ✅ Route d'accueil
   - ✅ Health check
   - ✅ Documentation Swagger
   - ✅ Gestion des erreurs 404

## 🔧 Configuration des Tests

### Base de Données de Test

- Utilise MongoDB Memory Server pour les tests
- Base de données isolée pour chaque suite de tests
- Nettoyage automatique après chaque test

### Authentification

- Création automatique d'utilisateurs de test
- Génération de tokens JWT pour les tests
- Nettoyage des données après chaque test

### Variables d'Environnement

Les tests utilisent des variables d'environnement de test automatiquement configurées.

## 📈 Statistiques des Tests

- **Total des fichiers de test** : 6
- **Routes testées** : 20+
- **Scénarios de test** : 80+
- **Couverture** : Authentification, CRUD, Permissions, Validation

## 🐛 Dépannage

### Erreur de connexion à la base de données

```bash
# Vérifier que MongoDB Memory Server est installé
npm install mongodb-memory-server --save-dev
```

### Timeout des tests

```bash
# Augmenter le timeout dans .mocharc.json
{
  "timeout": 15000
}
```

### Tests qui échouent

```bash
# Exécuter un test spécifique pour debug
npx mocha test/auth.test.js --timeout 30000
```

## 📝 Ajout de Nouveaux Tests

1. Créer un nouveau fichier `*.test.js` dans le dossier `test/`
2. Suivre la structure existante :

   ```javascript
   const request = require('supertest');
   const { expect } = require('chai');
   const app = require('../server');

   describe('Mon Test', function () {
     // Tests ici
   });
   ```

3. Exécuter les tests pour vérifier

## 🎯 Bonnes Pratiques

- ✅ Un test par fonctionnalité
- ✅ Tests isolés et indépendants
- ✅ Nettoyage des données après chaque test
- ✅ Noms de tests descriptifs
- ✅ Couverture des cas d'erreur
- ✅ Tests des permissions
- ✅ Validation des réponses

---

**Made with ❤️ and Mocha + Chai + Supertest**
