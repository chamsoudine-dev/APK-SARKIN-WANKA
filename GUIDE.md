# Guide Sarkin Wanka v4.1

## Comment fonctionnent les mises à jour
- **Mise à jour rapide** (cas courant, ~1 Mo) : vous modifiez `index.html`, vous lancez `PUBLIER.bat` → choix 1.
  Le paquet est envoyé sur `sarkin-wanka-71b0d.web.app/update/`. L'utilisateur ouvre *Paramètres → Mises à jour* et clique
  *Mettre à jour maintenant* : l'application télécharge, vérifie (empreinte SHA-256), redémarre. Données conservées.
  Si la nouvelle version plante au démarrage, l'application revient seule à la précédente (délai ~15 s).
- **Version complète** (rare : code Android, nouveau plugin) : `PUBLIER.bat` → choix 2. L'APK est hébergé sur GitHub (Releases) car Firebase gratuit refuse les fichiers exécutables. L'utilisateur télécharge le nouvel
  APK depuis le même écran ; Android demande de confirmer l'installation (installation 100 % silencieuse impossible).
- Les numéros : `package.json` est la source (versionName Android, `APP_VER` de la page, cache hors-ligne). Le `versionCode`
  Android est automatique (horodatage), donc toujours croissant.
- `update-meta.json` mémorise la version Android minimale requise (`minNative`) : une mise à jour rapide ne sera proposée
  qu'aux téléphones qui ont au moins cette version Android ; les autres sont dirigés vers l'APK.

## Sécurité — à retenir
- La clé de signature et son mot de passe ne sont **plus** dans le code : `android/keystore.properties` (ignoré par Git).
- Le site Firebase ne publie plus que le dossier `hosting/` (avant : tout le projet, `android/` compris).
- Mot de passe : PBKDF2 + sel aléatoire, 6 caractères minimum. Code employé : écrans réduits (UI seulement, pas de chiffrement).
- Sauvegardes : chiffrées (AES-GCM) si une phrase secrète est saisie ; mot de passe/2FA/code employé jamais exportés.
- Le plugin de mise à jour est configuré sans autoUpdate et **sans statistiques** vers un service tiers.

## Limites connues
- Pas de synchronisation entre téléphones (données locales). Pas de langue haoussa. Pas de photos de modèles.
- Le code employé masque des écrans ; il ne protège pas contre quelqu'un qui extrairait les données du téléphone.
