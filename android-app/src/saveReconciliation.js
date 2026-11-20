// Keep edits made during an async Save in the editor instead of replacing
// them with the older submitted snapshot. Pure helper for unit testing.
function reconcileAfterSave(savedEntry, liveEntry, editedDuringSave) {
  if (!savedEntry || typeof savedEntry !== 'object' || !savedEntry.id) {
    throw new Error('Invalid completed invitation Save');
  }
  if (!editedDuringSave) {
    return { invite:savedEntry, hasUnsavedEdits:false };
  }
  if (!liveEntry || typeof liveEntry !== 'object') {
    throw new Error('Invalid live invitation');
  }
  return {
    invite:{
      ...liveEntry,
      id:savedEntry.id,
      createdAt:savedEntry.createdAt || liveEntry.createdAt || null
    },
    hasUnsavedEdits:true
  };
}
module.exports = {reconcileAfterSave};
