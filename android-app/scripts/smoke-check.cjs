// Source-level regression checks. These do not replace Android device tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const designsSource = fs.readFileSync('src/designs.js', 'utf8');
const appSource = fs.readFileSync('App.js', 'utf8');
const packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));

function readLiteral(name) {
  const start = designsSource.indexOf('export const ' + name + ' = ');
  assert.ok(start !== -1, 'Missing exported data: ' + name);
  const literalStart = start + ('export const ' + name + ' = ').length;
  const literalEnd = designsSource.indexOf('\n];', literalStart);
  assert.ok(literalEnd !== -1, 'Missing array ending for ' + name);
  return vm.runInNewContext('(' + designsSource.slice(literalStart, literalEnd + 2) + ')', {}, { timeout: 1000 });
}

const templates = readLiteral('DESIGNS');
const categories = ['Royal', 'Floral', 'Traditional', 'Modern'];
const counts = {Royal: 2, Floral: 2, Traditional: 1, Modern: 1};
assert.equal(templates.length, 6, 'Exactly six invitation designs required');
assert.equal(new Set(templates.map(d => d.id)).size, 6, 'Duplicate template IDs');
assert.equal(new Set(templates.map(d => d.name)).size, 6, 'Duplicate template names');
for (const d of templates) {
  assert.ok(d.id && d.name && d.subtitle, 'Design identity is incomplete');
  assert.ok(categories.includes(d.category), 'Unexpected category for ' + d.name);
  assert.ok(Array.isArray(d.background) && d.background.length >= 2, 'Missing gradient for ' + d.name);
  for (const color of [...d.background, d.ink, d.line]) {
    assert.match(color, /^#[0-9a-fA-F]{6}$/, 'Invalid theme color for ' + d.name);
  }
}
for (const category of categories) {
  assert.equal(templates.filter(d => d.category === category).length, counts[category], category + ' filter count changed');
}

assert.equal(packageInfo.version, config.expo.version, 'App and package versions must agree');
assert.equal(config.expo.android.versionCode, 3, 'Android v1.1.1 versionCode must be 3');
assert.ok(appSource.includes("const BETA_VERSION='"+packageInfo.version+"'"), 'Visible beta version must match package version');
assert.equal(config.expo.extra.appMode, 'free-beta', 'Beta mode must not be silently removed');
assert.equal(config.expo.extra.distribution, 'APPLIQ-candidate', 'Do not mark as published');

for (const [name, source, needle] of [
  ['six-card gallery', appSource, 'filtered.map(d=>'],
  ['filter reset', appSource, "setDesignFilter('All')"],
  ['local draft loading', appSource, 'AsyncStorage.getItem(KEY)'],
  ['local draft saving', appSource, 'AsyncStorage.setItem(KEY,JSON.stringify(next))'],
  ['local storage failure guard', appSource, 'if(storageError)'],
  ['no duplicate saves', appSource, 'if(savingInFlight.current)return'],
  ['unsaved edit warning', appSource, 'confirmDiscard'],
  ['blank details for real new invitations', appSource, "bride:'',groom:'',date:'',time:'',venue:''"],
  ['fresh invitation action in Create tab', appSource, "if(tab!=='editor')newInvite()"],
  ['optional local photo picker', appSource, 'ImagePicker.launchImageLibraryAsync'],
  ['local copy of photos', appSource, 'FileSystem.copyAsync'],
  ['front/back selection', appSource, "setSide('back')"],
  ['PNG capture', appSource, 'shot.current.capture()'],
  ['prevent duplicate PNG exports', appSource, 'if(!shot.current||exportInFlight.current)return'],
  ['Hindi occasion selection', appSource, 'hindiOccasions[o]||o'],
  ['image saving', appSource, 'MediaLibrary.createAssetAsync'],
  ['native PNG sharing', appSource, 'Sharing.shareAsync'],
  ['Hindi editor labels', appSource, "दुल्हन का नाम"],
  ['watermark', designsSource, 'FREE BETA'],
]) {
  assert.ok(source.includes(needle), 'Missing ' + name);
}
console.log('PASS: 6 valid designs, 4 filters, version alignment, offline drafts, safety guards, Hindi editor and PNG export integration');
