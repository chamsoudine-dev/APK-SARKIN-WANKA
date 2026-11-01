# Sarkin Wanka — Gestion d'atelier (v4)

## Contenu du dossier
| Fichier / dossier | Rôle |
|---|---|
| `index.html` | Toute l'application (commandes, clients, historique, atelier, finances, paramètres, sécurité) |
| `sw.js`, `manifest.json` | Installation sur téléphone + fonctionnement hors-ligne |
| `assets/img/` | Logo et icônes |
| `firebase.json`, `.firebaserc` | Configuration d'hébergement (projet `sarkin-wanka`) |
| `DEPLOYER_FIREBASE.bat` | Mise en ligne en double-clic (Windows) |
| `firestore.rules`, `storage.rules` | Règles fermées (la v4 n'utilise pas ces services) |
| `ancien_version/` | Sauvegarde de l'ancienne version (non mise en ligne) |

## Mettre en ligne
1. Installer Node.js : https://nodejs.org
2. Double-cliquer sur `DEPLOYER_FIREBASE.bat`, se connecter avec le compte Google du projet.
3. Le site est disponible sur https://sarkin-wanka.web.app

Le script ne déploie que le site (`--only hosting`) : il ne touche pas aux données ni aux règles déjà présentes sur Firebase.

## Installer sur téléphone
- Android (Chrome) : menu ⋮ → « Ajouter à l'écran d'accueil ».
- iPhone (Safari) : Partager → « Sur l'écran d'accueil ».

## Où sont les données ? (important)
Les données sont enregistrées **dans le navigateur de l'appareil** (IndexedDB + copie de secours), à chaque action, avec un instantané automatique toutes les heures.
- Deux appareils ne voient **pas** les mêmes commandes tant que la synchronisation Firebase n'est pas ajoutée.
- Effacer les données du navigateur efface la base : **exportez une sauvegarde** (Paramètres → Exporter) régulièrement et gardez le fichier hors du téléphone.
- Pour passer d'un appareil à l'autre : Exporter sur l'un, Importer sur l'autre.

## Sécurité
- Mot de passe : bloque l'accès à l'écran (il ne chiffre pas les données). Il n'est pas récupérable.
- 2FA : application d'authentification (Google Authenticator, Microsoft Authenticator, Authy). Notez les 8 codes de secours.
- 2FA par WhatsApp / SMS / e-mail : nécessite un serveur, non actif dans cette version.

## Impression
Formats : ticket 58 mm, ticket 80 mm, A6, A5, A4. Impression automatique réglable dans Paramètres.
Impression sans fenêtre (PC de caisse) : lancer Chrome avec `--kiosk-printing`.

## Mettre à jour plus tard
Remplacer `index.html`, changer le nom de version dans `sw.js` (`sarkin-wanka-v4` → `v5`), puis relancer le déploiement.
