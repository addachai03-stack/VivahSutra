const assert = require('node:assert/strict');
const {KEY,encodeWorkingCopy,decodeWorkingCopy,createWorkingCopyStore} = require('../src/workingCopy');
const invite={id:null,designId:'rajwada',occasion:'Wedding',bride:'आशा',groom:'Ravi',message:'Wedding note'};
function memory(){
  const values=new Map(),events=[];
  return {values,events,
    getItem:async key=>{events.push(['read',key]);return values.has(key)?values.get(key):null;},
    setItem:async(key,val)=>{events.push(['write',key]);values.set(key,val);},
    removeItem:async key=>{events.push(['clear',key]);values.delete(key);}
  };
}
(async()=>{
  const fixed='2026-11-19T08:00:00.000Z';
  const db=memory();
  const store=createWorkingCopyStore(db,()=>fixed);
  assert.equal(await store.read(),null);
  await store.save(invite);
  assert.equal((await store.read()).invite.bride,'आशा');
  assert.equal((await store.read()).savedAt,fixed);
  const encoded=encodeWorkingCopy(invite,fixed);
  assert.deepEqual(decodeWorkingCopy(encoded),{invite:decodeWorkingCopy(encoded).invite,savedAt:fixed});
  assert.equal(decodeWorkingCopy(null),null);
  assert.throws(()=>decodeWorkingCopy('{broken json'));
  assert.throws(()=>decodeWorkingCopy(JSON.stringify({format:'other',version:1,savedAt:fixed,invite})));
  assert.throws(()=>encodeWorkingCopy({...invite,bride:'x'.repeat(4001)},fixed));
  assert.throws(()=>encodeWorkingCopy({...invite,designId:''},fixed));

  // Real Save should not delete a newer queued keystroke.
  const initial=store.save({...invite,message:'First'});
  const later=store.save({...invite,message:'Newer text'});
  const compare=store.clearIfUnchanged({...invite,message:'First'});
  await Promise.all([initial,later]);
  const preserved=await compare;
  assert.equal(preserved.cleared,false);
  assert.equal(preserved.newerCopy.invite.message,'Newer text');
  assert.equal((await store.read()).invite.message,'Newer text');
  assert.deepEqual(await store.clearIfUnchanged({...invite,message:'Newer text'}),{cleared:true,newerCopy:null});
  assert.equal(await store.read(),null);
  assert.deepEqual(await store.clearIfUnchanged(invite),{cleared:true,newerCopy:null});

  const first=store.save({...invite,message:'A'});
  const second=store.save({...invite,message:'B'});
  const clear=store.clear();
  await Promise.all([first,second,clear]);
  assert.equal(await store.read(),null,'Clearing after pending edits must remove old working copy');
  await store.save({...invite,message:'Latest'});
  assert.equal((await store.read()).invite.message,'Latest');

  // Never overwrite an unreadable working copy, including when a newer edit is queued.
  const damaged=memory();
  damaged.values.set(KEY,'{invalid json');
  const guarded=createWorkingCopyStore(damaged,()=>fixed);
  await assert.rejects(guarded.read(),/JSON|position|Unexpected/);
  await assert.rejects(guarded.save({...invite,message:'Must not overwrite'}),e=>e.code==='WORKING_COPY_RECOVERY_REQUIRED');
  await assert.rejects(guarded.clearIfUnchanged(invite),e=>e.code==='WORKING_COPY_RECOVERY_REQUIRED');
  assert.equal(damaged.values.get(KEY),'{invalid json');
  await guarded.clear(); // Explicit user consent is required by App UI.
  await guarded.save({...invite,message:'New after discard'});
  assert.equal((await guarded.read()).invite.message,'New after discard');

  // Saving a brand-new invitation assigns an ID to a newer unfinished edit,
  // preventing duplicate invitations when a user restores it after force-close.
  const saveStore=createWorkingCopyStore(memory(),()=>fixed);
  const submitted={...invite,id:null,message:'At Save'};
  const committed={...submitted,id:'invite-101',createdAt:'2026-11-20T04:00:00.000Z'};
  await saveStore.save({...submitted,message:'After Save'});
  const updated=await saveStore.reconcileCompletedSave(submitted,committed);
  assert.equal(updated.cleared,false);
  assert.equal(updated.newerCopy.invite.id,'invite-101');
  assert.equal(updated.newerCopy.invite.message,'After Save');
  assert.equal(updated.newerCopy.invite.createdAt,committed.createdAt);
  assert.equal((await saveStore.read()).invite.id,'invite-101');
  assert.equal((await saveStore.read()).invite.message,'After Save');
  // A fresh working copy containing exactly what was saved is safe to clear.
  const exactStore=createWorkingCopyStore(memory(),()=>fixed);
  await exactStore.save(submitted);
  assert.deepEqual(await exactStore.reconcileCompletedSave(submitted,committed),{cleared:true,newerCopy:null});
  assert.equal(await exactStore.read(),null);
  // A concurrent keystroke queued before reconciliation must be kept.
  const raceStore=createWorkingCopyStore(memory(),()=>fixed);
  const before=raceStore.save(submitted);
  const after=raceStore.save({...submitted,message:'Quick edit'});
  const raceDone=raceStore.reconcileCompletedSave(submitted,committed);
  await Promise.all([before,after]);
  assert.equal((await raceDone).newerCopy.invite.message,'Quick edit');
  assert.equal((await raceStore.read()).invite.id,'invite-101');
  // Another invitation's working copy must never be assigned the current ID.
  const otherStore=createWorkingCopyStore(memory(),()=>fixed);
  await otherStore.save({...invite,id:'other-id',message:'Other wedding'});
  const other=await otherStore.reconcileCompletedSave(submitted,committed);
  assert.equal(other.cleared,false);
  assert.equal(other.newerCopy.invite.id,'other-id');
  assert.equal((await otherStore.read()).invite.id,'other-id');
  // Recovery metadata write failure cannot erase the newer copy.
  const failMeta=memory();
  await createWorkingCopyStore(failMeta,()=>fixed).save({...submitted,message:'Later'});
  failMeta.setItem=async()=>{throw new Error('disk full during id fix');};
  await assert.rejects(
    createWorkingCopyStore(failMeta,()=>fixed).reconcileCompletedSave(submitted,committed),
    /disk full during id fix/
  );
  assert.equal(decodeWorkingCopy(failMeta.values.get(KEY)).invite.message,'Later');
  assert.throws(()=>otherStore.reconcileCompletedSave(submitted,{...committed,id:null}),/saved ID/);
  const stillDamaged=memory();
  stillDamaged.values.set(KEY,'{broken json');
  const stillBlocked=createWorkingCopyStore(stillDamaged,()=>fixed);
  await assert.rejects(stillBlocked.read());
  await assert.rejects(stillBlocked.reconcileCompletedSave(submitted,committed),e=>e.code==='WORKING_COPY_RECOVERY_REQUIRED');

  // An intermittent read failure can be retried without discarding existing bytes.
  const retryDb=memory();
  retryDb.values.set(KEY,encodeWorkingCopy(invite,fixed));
  const originalGet=retryDb.getItem.bind(retryDb);
  let failRead=true;
  retryDb.getItem=async key=>{if(failRead){failRead=false;throw new Error('temporary read failure');}return originalGet(key);};
  const retryStore=createWorkingCopyStore(retryDb,()=>fixed);
  await assert.rejects(retryStore.read(),/temporary read failure/);
  await assert.rejects(retryStore.save(invite),e=>e.code==='WORKING_COPY_RECOVERY_REQUIRED');
  assert.equal((await retryStore.read()).invite.bride,invite.bride);
  await retryStore.save({...invite,message:'Retry succeeded'});
  assert.equal((await retryStore.read()).invite.message,'Retry succeeded');

  let once=true;
  const failed=memory();
  failed.setItem=async(key,val)=>{if(once){once=false;throw new Error('disk not writable');}failed.values.set(key,val);};
  const failures=createWorkingCopyStore(failed);
  await assert.rejects(failures.save(invite),/disk not writable/);
  await failures.save({...invite,message:'Recovered'});
  assert.equal((await failures.read()).invite.message,'Recovered','A write failure does not permanently break the queue');
  console.log('PASS: unfinished-work serialization, saved-ID reconciliation, no duplicate recovery, corrupted storage protection');
})().catch(e=>{console.error(e);process.exitCode=1;});
