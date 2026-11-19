// Local invitation storage + user-controlled JSON backup. No network operations.
// Existing primary key is preserved for all historical Android beta installs.
const PRIMARY_KEY = 'vivahsutra-native-drafts-v1';
const MIRROR_KEY = 'vivahsutra-native-drafts-v1-recovery';
const FORMAT = 'vivahsutra-invitations-backup';
const BACKUP_VERSION = 1;
const MAX_DRAFTS = 200;
const MAX_CHARS = 2000000;
const ALLOWED_FIELDS = ['id','designId','accent','language','occasion','bride','groom','date','time','venue','host','relatives','rsvp','message','bridePhoto','groomPhoto','createdAt','updatedAt'];

function validateDrafts(value) {
  if (!Array.isArray(value) || value.length > MAX_DRAFTS) throw new Error('Invalid invitation list');
  const used = new Set();
  for (const draft of value) {
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new Error('Invalid invitation');
    if (typeof draft.id !== 'string' || !draft.id.trim() || draft.id.length > 150 || used.has(draft.id)) {
      throw new Error('Invalid or repeated invitation ID');
    }
    used.add(draft.id);
    if (typeof draft.bride !== 'string' || typeof draft.groom !== 'string') throw new Error('Invalid couple names');
    for (const field of ALLOWED_FIELDS) {
      const data = draft[field];
      if (data != null && (typeof data !== 'string' || data.length > 4000)) throw new Error('Invalid invitation field');
    }
  }
  const json = JSON.stringify(value);
  if (json.length > MAX_CHARS) throw new Error('Invitation backup is too large');
  return value;
}

function parseDrafts(raw) {
  if (raw == null) return null;
  if (typeof raw !== 'string' || raw.length > MAX_CHARS) throw new Error('Invalid invitation storage');
  return validateDrafts(JSON.parse(raw));
}

async function readLocalDrafts(storage) {
  // A read I/O failure is NOT evidence of missing data: do not overwrite it.
  const primaryRaw = await storage.getItem(PRIMARY_KEY);
  if (primaryRaw !== null) {
    let parsed;
    try { parsed = parseDrafts(primaryRaw); }
    catch (error) { parsed = null; /* Malformed primary: try the mirror. */ }
    if (parsed !== null) {
      // First upgrade from older beta: seed a mirror without touching the original key.
      // Never replace a prior recovery snapshot automatically when [] is read.
      if (parsed.length > 0) {
        try {
          if (await storage.getItem(MIRROR_KEY) === null) {
            await storage.setItem(MIRROR_KEY, JSON.stringify(parsed));
          }
        } catch (error) { /* Reading the valid primary should remain possible. */ }
      }
      return { drafts: parsed, recovered: false };
    }
  }
  const mirrorRaw = await storage.getItem(MIRROR_KEY);
  if (mirrorRaw !== null) {
    const recovered = parseDrafts(mirrorRaw);
    // Restore only when the primary is absent or invalid. No overwrite on valid [].
    await storage.setItem(PRIMARY_KEY, JSON.stringify(recovered));
    return { drafts: recovered, recovered: true };
  }
  if (primaryRaw === null) return { drafts: [], recovered: false };
  throw new Error('Invitations could not be read; do not overwrite storage');
}

// The mirror is written before the primary, then refreshed. A write failure
// before primary commit leaves the old drafts intact; no empty default writes.
async function writeLocalDrafts(storage, previous, next, options = {}) {
  validateDrafts(previous);
  validateDrafts(next);
  const { drafts: current } = await readLocalDrafts(storage);
  if (JSON.stringify(current) !== JSON.stringify(previous)) {
    throw new Error('Saved invitations changed; reload before editing');
  }
  if (!options.preserveRecoveredDrafts) {
    // Do not silently overwrite a local recovery snapshot containing IDs
    // absent from the current primary list, even if the primary is valid [].
    const pending = await inspectRecoverySnapshot(storage, current);
    if (pending.added > 0) {
      const error = new Error('Missing invitations exist in the recovery copy; review before saving');
      error.code = 'RECOVERY_REQUIRED';
      throw error;
    }
  }
  // During an explicit recovery, keep the recovered candidate in the mirror
  // even if writing the primary fails. Otherwise preserve the last good state.
  const preWriteMirror = options.preserveRecoveredDrafts ? next : previous;
  await storage.setItem(MIRROR_KEY, JSON.stringify(preWriteMirror));
  await storage.setItem(PRIMARY_KEY, JSON.stringify(next));
  try {
    await storage.setItem(MIRROR_KEY, JSON.stringify(next));
    return { backupSynced: true };
  } catch (error) {
    // The primary save succeeded. Show a warning rather than claiming it failed.
    return { backupSynced: false };
  }
}

// Optional inspection only: never auto-revive deleted drafts from a valid [].
// The user can choose to merge missing IDs from a prior local recovery snapshot.
async function inspectRecoverySnapshot(storage, existing) {
  validateDrafts(existing);
  const raw = await storage.getItem(MIRROR_KEY);
  if (raw === null) return { drafts: existing, added: 0, skipped: 0, snapshotCount: 0 };
  const snapshot = parseDrafts(raw);
  const outcome = mergeBackup(existing, snapshot);
  return { ...outcome, snapshotCount: snapshot.length };
}

// Read-only metadata for troubleshooting on the phone. Never print names,
// invitation fields or raw backup content, and never write to AsyncStorage.
async function inspectStorageHealth(storage) {
  const inspectOne = async (key) => {
    try {
      const raw = await storage.getItem(key);
      if (raw === null) return { status:'missing', count:0 };
      try {
        const drafts = parseDrafts(raw);
        return { status:drafts.length===0?'empty':'valid', count:drafts.length };
      } catch(error) { return { status:'invalid', count:null }; }
    } catch(error) { return { status:'unreadable', count:null }; }
  };
  const [primary, recovery] = await Promise.all([
    inspectOne(PRIMARY_KEY),
    inspectOne(MIRROR_KEY)
  ]);
  let missingFromPrimary = null;
  if ((primary.status==='valid'||primary.status==='empty') &&
      (recovery.status==='valid'||recovery.status==='empty')) {
    try {
      const current = parseDrafts(await storage.getItem(PRIMARY_KEY));
      const backup = parseDrafts(await storage.getItem(MIRROR_KEY));
      missingFromPrimary = mergeBackup(current,backup).added;
    } catch(error) { missingFromPrimary=null; }
  }
  return { primary, recovery, missingFromPrimary };
}

function makeBackupFile(drafts, createdAt) {
  validateDrafts(drafts);
  return JSON.stringify({format: FORMAT,version: BACKUP_VERSION,exportedAt: createdAt,drafts},null,2);
}

function readBackupFile(text) {
  if (typeof text !== 'string' || text.length > MAX_CHARS + 10240) throw new Error('Backup too large');
  const file = JSON.parse(text);
  if (!file || file.format !== FORMAT || file.version !== BACKUP_VERSION) throw new Error('This is not a VivahSutra backup');
  return validateDrafts(file.drafts);
}

function mergeBackup(existing, imported) {
  validateDrafts(existing);
  validateDrafts(imported);
  const known = new Set(existing.map(d => d.id));
  const added = imported.filter(d => !known.has(d.id));
  return { drafts: validateDrafts([...existing, ...added]), added: added.length, skipped: imported.length - added.length };
}

module.exports = { PRIMARY_KEY, MIRROR_KEY, validateDrafts, readLocalDrafts, writeLocalDrafts, inspectRecoverySnapshot, inspectStorageHealth, makeBackupFile, readBackupFile, mergeBackup };
