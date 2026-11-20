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
assert.equal(config.expo.android.versionCode, 19, 'Android v1.1.17 source versionCode must be 19 before CI assigns the beta build code');
assert.ok(appSource.includes("const BETA_VERSION='"+packageInfo.version+"'"), 'Visible beta version must match package version');
assert.equal(config.expo.extra.appMode, 'free-beta', 'Beta mode must not be silently removed');
assert.equal(config.expo.extra.distribution, 'APPLIQ-candidate', 'Do not mark as published');

for (const [name, source, needle] of [
  ['six-card gallery', appSource, 'filtered.map(d=>'],
  ['gallery selection state', appSource, 'const [selectedDesignId,setSelectedDesignId]=useState(null)'],
  ['automatic GitHub update check', appSource, 'checkForBetaUpdate(installedBuildCode,fetch)'],
  ['open verified browser download link', appSource, 'Linking.openURL(apkUrl)'],
  ['manual Check for updates button', appSource, 'CHECK FOR UPDATES'],
  ['direct update action from manual check', appSource, "onPress:()=>confirmBetaDownload(result.apkUrl)"],
  ['native build code comparison', appSource, 'Application.nativeBuildVersion'],
  ['tap to select card', appSource, 'grid?setSelectedDesignId(design.id):newInvite(design.id)'],
  ['selected design confirmation', appSource, 'CONTINUE WITH SELECTED DESIGN'],
  ['selected design goes to editor', appSource, 'newInvite(selectedDesignId)'],
  ['editor design radio selection', appSource, 'accessibilityRole="radio"'],
  ['selection resets when category changes', appSource, 'setSelectedDesignId(null);'],
  ['full-width gallery cards', appSource, "grid&&{flex:0,flexBasis:'auto',width:'100%',minHeight:245"],
  ['nonwrapping gallery layout', appSource, "grid:{width:'100%',flexDirection:'column',gap:12}"],
  ['filter reset', appSource, "setDesignFilter('All')"],
  ['local draft loading and recovery', appSource, 'readLocalDrafts(AsyncStorage)'],
  ['safe local mirror', appSource, 'draftsRef.current=result.drafts'],
  ['export invitations backup', appSource, 'makeBackupFile(draftsRef.current'],
  ['import invitations backup', appSource, 'readBackupFile(content)'],
  ['non-destructive restore', appSource, 'mergeBackup(current,imported)'],
  ['document backup picker', appSource, 'DocumentPicker.getDocumentAsync'],
  ['single active draft writer', appSource, 'draftWriteInFlight.current'],
  ['backup controls visible', appSource, 'EXPORT BACKUP FILE'],
  ['restore controls visible', appSource, 'RESTORE BACKUP FILE'],
  ['voluntary local copy recover action', appSource, 'RECOVER FROM LOCAL COPY'],
  ['inspect snapshot without automatic restore', appSource, 'inspectRecoverySnapshot(AsyncStorage,draftsRef.current)'],
  ['recovery writes retain snapshot on failure', appSource, 'preserveRecoveredDrafts:true'],
  ['storage diagnostics visible', appSource, 'CHECK LOCAL STORAGE'],
  ['recovery mirror repair consent prompt', appSource, 'Repair damaged recovery copy?'],
  ['repair only invalid local recovery', appSource, 'repairInvalidRecoveryMirror(AsyncStorage)'],
  ['repair button visible only after invalid diagnostics', appSource, 'REPAIR LOCAL RECOVERY COPY'],
  ['quarantine collision is not overwritten', appSource, "e?.code==='QUARANTINE_EXISTS'"],
  ['read-only local storage diagnostics', appSource, 'inspectStorageHealth(AsyncStorage)'],
  ['recovery copy overwrites prevented', appSource, "e?.code==='RECOVERY_REQUIRED'"],
  ['local draft saving', appSource, 'writeLocalDrafts(AsyncStorage,previous,next)'],
  ['local storage failure guard', appSource, 'if(storageError)'],
  ['no duplicate saves', appSource, 'if(savingInFlight.current||draftWriteInFlight.current)return'],
  ['unsaved edit warning', appSource, 'confirmDiscard'],
  ['android Back warns about unsaved edits', appSource, "if(tab==='editor'&&hasUnsavedEdits)"],
  ['tab transition warns about unsaved edits', appSource, "if(tab==='editor'&&hasUnsavedEdits){"],
  ['resume editing from Home', appSource, 'RESUME EDITING'],
  ['unsaved session storage', appSource, 'createWorkingCopyStore(AsyncStorage)'],
  ['autosave working copy', appSource, 'workingCopyStore.current.save(invite)'],
  ['preserve unreadable local draft', appSource, 'if(!workingLoaded||!hasUnsavedEdits||workingCopyError||workingCandidate)return;'],
  ['show local save status', appSource, "workingCopyStatus==='saved'"],
  ['autowrite failure warning', appSource, "setWorkingCopyStatus('error')"],
  ['do not report stale save as current', appSource, 'if(seq===workingSaveSeq.current)'],
  ['working copy recovery after relaunch', appSource, 'RESTORE UNFINISHED INVITATION'],
  ['explicit consent before discarding', appSource, 'Discard unfinished invitation?'],
  ['saved ID propagated to unfinished work', appSource, 'await workingCopyStore.current.reconcileCompletedSave(invite,entry)'],
  ['capture edit revision at Save start', appSource, 'const revisionAtSave=editRevision.current'],
  ['avoid replacing text typed during Save', appSource, 'reconcileAfterSave(entry,current,changedDuringSave).invite'],
  ['keep unsaved indicator if edits continued', appSource, 'setHasUnsavedEdits(changedDuringSave)'],
  ['restore copy only when not actively editing', appSource, 'setWorkingCandidate(editingContinued?null:cleanup.newerCopy)'],
  ['protect navigation while save runs', appSource, "if(savingInFlight.current){Alert.alert('Saving invitation'"],
  ['clear unfinished work only after user-confirmed discard', appSource, 'await workingCopyStore.current.clear()'],
  ['invalid working-copy record recovery', appSource, 'RETRY WORKING COPY'],
  ['unreadable copy discard requires confirmation', appSource, 'Discard unreadable unfinished work?'],
  ['Create tab returns to unsaved edit', appSource, "if(tab!=='editor'&&hasUnsavedEdits){setTab('editor');return;}"],
  ['blank details for real new invitations', appSource, "bride:'',groom:'',date:'',time:'',venue:''"],
  ['fresh invitation action in Create tab', appSource, "if(tab!=='editor')newInvite()"],
  ['optional local photo picker', appSource, 'ImagePicker.launchImageLibraryAsync'],
  ['local copy of photos', appSource, 'FileSystem.copyAsync'],
  ['front/back selection', appSource, "setSide('back')"],
  ['PNG capture', appSource, 'shot.current.capture()'],
  ['save/gallery permission fallback', appSource, "result.status==='permission-denied'"],
  ['prevent duplicate PNG exports', appSource, 'if(!shot.current||exportInFlight.current)return'],
  ['Hindi occasion selection', appSource, 'hindiOccasions[o]||o'],
  ['image saving', appSource, 'mediaLibrary:MediaLibrary'],
  ['native PNG sharing', appSource, 'exportInvitationPng({'],
  ['Hindi editor labels', appSource, "दुल्हन का नाम"],
  ['watermark', designsSource, 'FREE BETA'],
]) {
  assert.ok(source.includes(needle), 'Missing ' + name);
}
console.log('PASS: 6 designs, 4 filters, version alignment, guarded drafts, backup/restore integration, Hindi editor and PNG export');
