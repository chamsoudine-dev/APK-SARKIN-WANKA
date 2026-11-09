#!/usr/bin/env node
/*
 * Publication d'une mise à jour Sarkin Wanka.
 *   node scripts/publish.js web   -> mise à jour rapide (application seulement, ~1 Mo, sans APK)
 *   node scripts/publish.js apk   -> version complète (nouvel APK + mise à jour)
 * Option : --sans-deploiement (prépare tout dans hosting/ sans envoyer sur Firebase)
 */
const fs = require('fs'), path = require('path'), cp = require('child_process'),
      crypto = require('crypto'), readline = require('readline');
const AdmZip = require('adm-zip');

const ROOT = path.join(__dirname, '..');
const mode = process.argv[2], flags = process.argv.slice(3);
if (!['web', 'apk'].includes(mode)) { console.error('Usage : node scripts/publish.js web|apk'); process.exit(1); }

const P = (...a) => path.join(ROOT, ...a);
const rd = f => fs.readFileSync(P(f), 'utf8');
const wr = (f, t) => fs.writeFileSync(P(f), t);
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0 ? 1 : -1; } return 0; };
const ask = q => new Promise(r => { const i = readline.createInterface({ input: process.stdin, output: process.stdout }); i.question(q, a => { i.close(); r(a.trim()); }); });
const run = (cmd, args, opt = {}) => { const r = cp.spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd: ROOT, ...opt }); if (r.status !== 0) throw new Error(`« ${cmd} ${args.join(' ')} » a échoué (code ${r.status})`); };
const step = t => console.log('\n=== ' + t + ' ===');
const CFG = JSON.parse(rd('update-config.json')); // identifiant du projet Firebase + adresse du site (un seul endroit)
const UPD_URL = CFG.siteUrl.replace(/\/$/, '') + '/update/';

(async () => {
  const pkg = JSON.parse(rd('package.json')), cur = pkg.version;
  const meta = JSON.parse(rd('update-meta.json'));
  const p = cur.split('.').map(Number), sug = meta.published ? `${p[0]}.${p[1]}.${p[2] + 1}` : cur;

  let ver = process.env.SW_VERSION || await ask(`Version actuelle : ${cur}. Nouvelle version [${sug}] : `) || sug;
  if (!/^\d+\.\d+\.\d+$/.test(ver)) throw new Error('Format de version invalide (exemple : 4.2.0)');
  if (cmp(ver, cur) < 0 || (cmp(ver, cur) === 0 && meta.published && meta.pending !== cur)) throw new Error(`La nouvelle version doit être supérieure à ${cur}`);
  const notes = process.env.SW_NOTES !== undefined ? process.env.SW_NOTES : await ask('Nouveautés (une phrase, visible par les utilisateurs) : ');

  if (!flags.includes('--sans-deploiement')) {
    step('0/5 Vérification de l’accès Firebase (avant la longue construction)');
    const r = cp.spawnSync('npx', ['firebase-tools@latest', 'hosting:sites:list', '--project', CFG.projectId], { cwd: ROOT, shell: true, encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    if (r.status !== 0 || !out.includes(new URL(CFG.siteUrl).hostname)) {
      console.error(out);
      throw new Error(`Accès impossible au projet « ${CFG.projectId} » (site ${CFG.siteUrl}). Lancez : npx firebase-tools@latest projects:list`);
    }
    console.log('Accès OK : ' + CFG.siteUrl);
  }
  step('1/5 Numéro de version ' + ver);
  meta.pending = ver; wr('update-meta.json', JSON.stringify(meta, null, 2) + '\n'); // permet de relancer avec le même numéro si la suite échoue
  pkg.version = ver; wr('package.json', JSON.stringify(pkg, null, 2) + '\n');
  let html = rd('index.html');
  if (!/const APP_VER="[^"]*";/.test(html)) throw new Error('APP_VER introuvable dans index.html');
  html = html.replace(/const APP_VER="[^"]*";/, `const APP_VER="${ver}";`);
  if (!/const UPD_URL="[^"]*";/.test(html)) throw new Error('UPD_URL introuvable dans index.html');
  wr('index.html', html.replace(/const UPD_URL="[^"]*";/, `const UPD_URL="${UPD_URL}";`));
  wr('sw.js', rd('sw.js').replace(/const V='[^']*';/, `const V='sarkin-wanka-v${ver}';`));

  step('2/5 Préparation de l’application');
  run('node', ['scripts/build-web.js']);

  const H = P('hosting'), U = path.join(H, 'update');
  fs.mkdirSync(U, { recursive: true });

  if (mode === 'apk') {
    step('3/5 Construction de l’APK (quelques minutes)');
    run('npx', ['cap', 'sync', 'android']);
    run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleRelease'], { cwd: P('android') });
    const apk = P('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (!fs.existsSync(apk)) throw new Error('APK introuvable après la construction');
    fs.mkdirSync(P('dist'), { recursive: true });
    fs.copyFileSync(apk, P('dist', 'SarkinWanka.apk')); // l'APK reste hors de hosting/ : Firebase (plan gratuit) refuse les fichiers exécutables
    meta.minNative = ver; meta.apk = { version: ver, notes };
  } else console.log('\n=== 3/5 APK : inchangé (mise à jour rapide) ===');

  step('4/5 Fichiers à publier (hosting/)');
  for (const f of ['index.html', 'manifest.json', 'sw.js']) fs.copyFileSync(P(f), path.join(H, f));
  fs.rmSync(path.join(H, 'assets'), { recursive: true, force: true });
  fs.cpSync(P('assets'), path.join(H, 'assets'), { recursive: true });
  fs.readdirSync(U).filter(f => /^web-.*\.zip$/.test(f) || /\.apk$/i.test(f)).forEach(f => fs.unlinkSync(path.join(U, f)));
  const zipName = `web-${ver}.zip`, zipPath = path.join(U, zipName);
  const z = new AdmZip(); z.addLocalFolder(P('www')); z.writeZip(zipPath);
  const vj = { schema: 1, updated: new Date().toISOString(), web: { version: ver, file: zipName, sha256: sha(zipPath), notes, minNative: meta.minNative || '' } };
  const apkPath = P('dist', 'SarkinWanka.apk');
  if (meta.apk) vj.apk = { version: meta.apk.version, url: CFG.apkUrl.replace('{version}', meta.apk.version), sha256: fs.existsSync(apkPath) ? sha(apkPath) : '', notes: meta.apk.notes || '' };
  else console.log('Note : aucun APK publié pour l’instant — seule la mise à jour rapide sera proposée.');
  fs.writeFileSync(path.join(U, 'version.json'), JSON.stringify(vj, null, 2));
  wr('update-meta.json', JSON.stringify(meta, null, 2) + '\n');
  const done = () => { meta.published = true; delete meta.pending; wr('update-meta.json', JSON.stringify(meta, null, 2) + '\n'); };
  console.log(`Paquet de mise à jour : ${zipName} (${(fs.statSync(zipPath).size / 1024).toFixed(0)} Ko)`);

  if (flags.includes('--sans-deploiement')) { done(); console.log('\nPrêt dans hosting/ (non envoyé : --sans-deploiement).'); return; }

  step('5/5 Mise en ligne sur Firebase');
  try { run('npx', ['firebase-tools@latest', 'deploy', '--only', 'hosting', '--project', CFG.projectId]); }
  catch (e) {
    console.error('\nLa mise en ligne a échoué. Tout est prêt dans hosting/. Connectez-vous puis relancez seulement l’envoi :');
    console.error('  npx firebase-tools@latest login');
    console.error('  npx firebase-tools@latest deploy --only hosting --project ' + CFG.projectId);
    process.exit(2);
  }
  done();
  try {
    const r = await fetch(UPD_URL + 'version.json?t=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    console.log(j.web && j.web.version === ver ? `\nVérifié en ligne : version ${ver} publiée ✔` : '\nAttention : la version en ligne diffère, réessayez dans une minute.');
  } catch (e) { console.log('\nPublié, mais la vérification en ligne a échoué (connexion ?).'); }
  console.log('\nTerminé. Les utilisateurs verront la mise à jour dans Paramètres → Mises à jour.');
  if (mode === 'apk') {
    console.log('\nDERNIÈRE ÉTAPE (manuelle, 1 minute) : mettre l’APK sur GitHub pour que les téléphones puissent le télécharger.');
    console.log('  1. Ouvrez : ' + CFG.releasePage.replace('{version}', ver));
    console.log('  2. Glissez le fichier : ' + apkPath);
    console.log('  3. Cliquez « Publish release ».');
  }
})().catch(e => { console.error('\nERREUR : ' + e.message); process.exit(1); });
