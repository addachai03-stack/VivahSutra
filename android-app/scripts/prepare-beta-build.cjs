// Runs only in CI checkout; does not commit version changes or touch user data.
const fs = require('node:fs');
const runNumber = Number(process.env.GITHUB_RUN_NUMBER);
if (!Number.isSafeInteger(runNumber) || runNumber <= 0 || runNumber > 1000000000) {
  throw new Error('Valid GITHUB_RUN_NUMBER required');
}
const versionCode = 100000 + runNumber;
if (versionCode > 2147483647) throw new Error('Android build version exceeds 32-bit limit');
const path = 'app.json';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));
if (config.expo.android.package !== 'com.vivahsutra.invites') throw new Error('Unexpected package name');
config.expo.android.versionCode = versionCode;
fs.writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
console.log('Prepared Android beta versionCode:', versionCode);
