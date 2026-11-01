# 🚀 Guide de Déploiement — Sarkin Wanka Fashion Design

## ✅ Ce qui a été corrigé

| Problème | Solution appliquée |
|----------|-------------------|
| Son bizarre au chargement | Supprimé `window.storage` event — remplacé par polling 30s uniquement après login tailleur |
| localStorage fragile | Migration vers **Firebase Firestore** (données persistantes à long terme) |
| Photos base64 lentes | Upload vers **Firebase Storage** (URL légère stockée en base) |
| Mots de passe en clair | Hachage SHA-256 avec salt dès la création |
| confirm/alert bloquants | Modaux personnalisés non-bloquants |
| Non installable sur mobile | PWA : `manifest.json` + Service Worker |
| Sidebar écrasée sur mobile | Bottom navigation mobile responsive |
| Chemins CSS incohérents | Tous unifiés vers `assets/css/style.css` |

---

## 📋 Étapes de configuration Firebase

### 1. Créer le projet Firebase

1. Aller sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer **"Ajouter un projet"**
3. Nom du projet : `sarkin-wanka` (ou votre choix)
4. Activer Google Analytics si souhaité

### 2. Activer Firestore

1. Dans le menu gauche → **Build → Firestore Database**
2. Cliquer **"Créer une base de données"**
3. Choisir **Mode production**
4. Région : `europe-west1` (le plus proche du Niger)
5. Copier le fichier `firestore.rules` fourni dans l'onglet **Règles**

### 3. Activer Firebase Storage

1. Dans le menu gauche → **Build → Storage**
2. Cliquer **"Commencer"**
3. Copier le fichier `storage.rules` fourni dans l'onglet **Règles**

### 4. Récupérer la configuration

1. Paramètres du projet (icône ⚙️) → **"Vos applications"**
2. Cliquer **"Ajouter une application Web"** (icône `</>`)
3. Nommer l'app `sarkin-wanka-web`
4. Copier l'objet `firebaseConfig`

### 5. Mettre à jour `assets/js/app.js`

Remplacez le bloc `FIREBASE_CONFIG` en haut du fichier :

```javascript
const FIREBASE_CONFIG = {
    apiKey:            "VOTRE_API_KEY_ICI",
    authDomain:        "votre-projet.firebaseapp.com",
    projectId:         "votre-projet-id",
    storageBucket:     "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abcdef"
};
```

### 6. Déployer sur GitHub Pages / Render

**GitHub Pages :**
```bash
# Dans votre dépôt GitHub
# Settings → Pages → Source : main branch / root
# URL : https://votre-user.github.io/votre-repo/
```

**Render :**
1. Lier votre repo GitHub
2. Type : **Static Site**
3. Build command : *(laisser vide)*
4. Publish directory : `.` (ou le dossier racine)

---

## 📱 Installation comme Application Mobile

### Android :
1. Ouvrir le site dans Chrome
2. Menu (⋮) → **"Ajouter à l'écran d'accueil"**
3. L'app s'installe comme une vraie application !

### iPhone :
1. Ouvrir le site dans Safari
2. Bouton Partager (□↑) → **"Sur l'écran d'accueil"**

---

## 🔐 Sécurité — À faire après déploiement

1. **Restreindre les règles Firestore** une fois que vous avez configuré Firebase Auth :
   ```
   allow read, write: if request.auth != null;
   ```

2. **Activer Firebase App Check** pour bloquer les requêtes non autorisées

3. **Configurer le domaine autorisé** dans Firebase Console :
   - Authentication → Settings → Domaines autorisés
   - Ajouter votre domaine Render/GitHub Pages

---

## 📊 Structure Firestore

```
firestore/
├── tasks/           # Toutes les commandes (auto-ID)
│   ├── client
│   ├── phone
│   ├── type
│   ├── price
│   ├── dueDate
│   ├── step         # agenda | atelier | boutique | livre
│   ├── assignee
│   ├── notes
│   ├── photo        # URL Firebase Storage (pas base64)
│   ├── createdAt    # Timestamp serveur
│   └── updatedAt    # Timestamp serveur
│
├── tailors/         # Comptes tailleurs
│   ├── username
│   ├── passwordHash # SHA-256 + salt (pas en clair)
│   └── createdAt
│
└── settings/
    └── main/        # Paramètres de l'atelier
        ├── name
        ├── phone
        ├── address
        ├── currency
        └── photo
```

---

## 🛠 Mode Hors-Ligne

Le Service Worker met en cache les pages principales.
Firebase Firestore met en cache les données automatiquement.
→ L'application fonctionne **même sans internet** après le premier chargement !

---

## 📞 Support

Pour toute question, vérifiez la console du navigateur (F12 → Console).
Les erreurs Firebase commencent par `FirebaseError:`.

**Erreur fréquente :** `Missing or insufficient permissions`
→ Vérifiez vos règles Firestore dans Firebase Console.
