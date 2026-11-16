// Lightweight repository smoke checks; no app data or device state is changed.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const designs = fs.readFileSync('src/designs.js', 'utf8');
const app = fs.readFileSync('App.js', 'utf8');
const entries = [...designs.matchAll(/\{id:'([^']+)',name:'([^']+)',subtitle:'([^']+)',category:'([^']+)',background:\[/g)];
assert.equal(entries.length, 6, 'Six invitation templates must be present');
assert.equal(new Set(entries.map(x => x[1])).size, 6, 'Template IDs must be unique');
assert.equal(new Set(entries.map(x => x[2])).size, 6, 'Template names must be unique');
for (const [, id, name, , category] of entries) {
  assert.ok(['Royal','Floral','Traditional','Modern'].includes(category), name + ' has an unknown category');
  assert.ok(id && name, 'Template must have ID and name');
}
for (const required of ["setDesignFilter('All')", 'filtered.map(d=>', 'InvitationCard', 'AsyncStorage.setItem', 'Sharing.shareAsync', 'MediaLibrary.createAssetAsync']) {
  assert.ok(app.includes(required), 'Missing core app integration: ' + required);
}
console.log('PASS: 6 unique designs, categories, filter reset, card renderer, local save and PNG sharing hooks');
