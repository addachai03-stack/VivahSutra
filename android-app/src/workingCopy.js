// Separate from the user's saved invitation list and its recovery mirror.
// Contains ONLY the local, unfinished invitation. No network or auto-publishing.
const KEY = 'vivahsutra-unsaved-working-copy-v1';
const FORMAT = 'vivahsutra-unsaved-invitation';
const VERSION = 1;
const MAX_LENGTH = 120000;
const FIELDS = ['id','designId','accent','language','occasion','bride','groom','date','time','venue','host','message','relatives','rsvp','bridePhoto','groomPhoto','createdAt','updatedAt'];

function cleanInvite(invite) {
  if (!invite || typeof invite !== 'object' || Array.isArray(invite)) throw new Error('Invalid unfinished invitation');
  const result = {};
  for (const key of FIELDS) {
    const value = invite[key];
    if (value == null) { result[key] = null; continue; }
    if (typeof value !== 'string' || value.length > 4000) throw new Error('Invalid unfinished invitation field');
    result[key] = value;
  }
  if (!result.designId || !result.occasion) throw new Error('Incomplete unfinished invitation');
  return result;
}
function encodeWorkingCopy(invite, savedAt) {
  const record = { format:FORMAT, version:VERSION, savedAt, invite:cleanInvite(invite) };
  const raw = JSON.stringify(record);
  if (raw.length > MAX_LENGTH) throw new Error('Unfinished invitation too large');
  return raw;
}
function decodeWorkingCopy(raw) {
  if (raw == null) return null;
  if (typeof raw !== 'string' || raw.length > MAX_LENGTH) throw new Error('Unfinished invitation storage invalid');
  const record = JSON.parse(raw);
  if (!record || record.format !== FORMAT || record.version !== VERSION ||
      typeof record.savedAt !== 'string' || Number.isNaN(Date.parse(record.savedAt))) {
    throw new Error('Unknown unfinished invitation backup');
  }
  return { invite:cleanInvite(record.invite), savedAt:record.savedAt };
}
// Serialise async writes, so a late keystroke cannot overtake a newer one.
// clear() is also queued: old saves cannot reappear after successful Save/Discard.
function createWorkingCopyStore(storage, clock = () => new Date().toISOString()) {
  let last = Promise.resolve();
  let recoveryBlocked = false;
  const enqueue = task => {
    const action = last.then(task);
    last = action.catch(() => undefined);
    return action;
  };
  return {
    save: invite => {
      const raw = encodeWorkingCopy(invite, clock());
      return enqueue(async () => {
        if (recoveryBlocked) {
          const error = new Error('Unreadable unfinished invitation must be recovered or explicitly discarded');
          error.code = 'WORKING_COPY_RECOVERY_REQUIRED';
          throw error;
        }
        await storage.setItem(KEY,raw);
      });
    },
    clear: () => enqueue(async () => {
      await storage.removeItem(KEY);
      recoveryBlocked = false;
    }),
    // Clear after a successful real invitation Save only if no newer changes
    // were written while that Save was pending.
    clearIfUnchanged: invite => {
      const expected = JSON.stringify(cleanInvite(invite));
      return enqueue(async () => {
        if (recoveryBlocked) {
          const error = new Error('Unfinished invitation must be reviewed before cleanup');
          error.code = 'WORKING_COPY_RECOVERY_REQUIRED';
          throw error;
        }
        const raw = await storage.getItem(KEY);
        if (raw === null) return {cleared:true, newerCopy:null};
        let copy;
        try { copy = decodeWorkingCopy(raw); }
        catch (error) {
          recoveryBlocked = true;
          throw error;
        }
        if (JSON.stringify(copy.invite) !== expected) {
          return {cleared:false, newerCopy:copy};
        }
        await storage.removeItem(KEY);
        return {cleared:true, newerCopy:null};
      });
    },
    // Complete an invitation Save without losing a newer unsaved edit. A new
    // draft gets its permanent ID copied into any newer working copy, so a
    // recovered edit updates that invitation instead of creating a duplicate.
    reconcileCompletedSave: (originalInvite, savedEntry) => {
      const original = cleanInvite(originalInvite);
      const saved = cleanInvite(savedEntry);
      if (typeof saved.id !== 'string' || !saved.id.trim()) {
        throw new Error('Completed invitation must have a saved ID');
      }
      return enqueue(async () => {
        if (recoveryBlocked) {
          const error = new Error('Unfinished invitation must be reviewed before cleanup');
          error.code = 'WORKING_COPY_RECOVERY_REQUIRED';
          throw error;
        }
        const raw = await storage.getItem(KEY);
        if (raw === null) return {cleared:true,newerCopy:null};
        let copy;
        try { copy=decodeWorkingCopy(raw); }
        catch(error) { recoveryBlocked=true;throw error; }
        if (JSON.stringify(copy.invite) === JSON.stringify(original)) {
          await storage.removeItem(KEY);
          return {cleared:true,newerCopy:null};
        }
        if (copy.invite.id !== original.id && copy.invite.id !== saved.id) {
          // Unrelated invitation: preserve it without rewriting metadata.
          return {cleared:false,newerCopy:copy};
        }
        const patched = {
          ...copy.invite,
          id:saved.id,
          createdAt:saved.createdAt || copy.invite.createdAt
        };
        // Preserve the timestamp unless this working copy is actually rewritten.
        if (JSON.stringify(patched) !== JSON.stringify(copy.invite)) {
          const stamped=clock();
          await storage.setItem(KEY,encodeWorkingCopy(patched,stamped));
          return {cleared:false,newerCopy:{invite:cleanInvite(patched),savedAt:stamped}};
        }
        return {cleared:false,newerCopy:copy};
      });
    },
    read: () => enqueue(async () => {
      try {
        const copy = decodeWorkingCopy(await storage.getItem(KEY));
        recoveryBlocked = false;
        return copy;
      } catch (error) {
        recoveryBlocked = true;
        throw error;
      }
    }),
  };
}
module.exports = {KEY,encodeWorkingCopy,decodeWorkingCopy,createWorkingCopyStore};
