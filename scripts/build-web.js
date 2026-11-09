// Copie les fichiers de l'application dans www/ (dossier embarqué dans l'APK et dans les mises à jour)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'manifest.json']) fs.copyFileSync(path.join(root, f), path.join(out, f));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
console.log('www/ prêt');
