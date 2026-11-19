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
  assert.equal(damaged.values.get(KEY),'{invalid json');
  await guarded.clear(); // Explicit user consent is required by App UI.
  await guarded.save({...invite,message:'New after discard'});
  assert.equal((await guarded.read()).invite.message,'New after discard');

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
  console.log('PASS: unfinished-work recovery, serialized writes, no overwrite after corrupt read, retry and consent-based clear');
})().catch(e=>{console.error(e);process.exitCode=1;});
