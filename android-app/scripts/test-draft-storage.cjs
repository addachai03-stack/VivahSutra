const assert = require('node:assert/strict');
const {PRIMARY_KEY,MIRROR_KEY,readLocalDrafts,writeLocalDrafts,makeBackupFile,readBackupFile,mergeBackup}=require('../src/draftStorage');
const one = {id:'a1',bride:'Asha',groom:'Ravi',designId:'rajwada',message:'सादर आमंत्रित'};
const two = {id:'b2',bride:'Meera',groom:'Dev',designId:'pastel'};
const store=(initial={})=>{
  const values=new Map(Object.entries(initial));
  return {
    values,
    getItem:async(key)=>values.has(key)?values.get(key):null,
    setItem:async(key,value)=>{values.set(key,value);},
  };
};
(async()=>{
  const historical=store({[PRIMARY_KEY]:JSON.stringify([one])});
  let result=await readLocalDrafts(historical);
  assert.equal(result.recovered,false);
  assert.equal(result.drafts.length,1);
  assert.equal((await writeLocalDrafts(historical,[one],[one,two])).backupSynced,true);
  assert.equal((await readLocalDrafts(historical)).drafts.length,2);
  assert.equal(JSON.parse(historical.values.get(MIRROR_KEY)).length,2);
  await assert.rejects(writeLocalDrafts(historical,[],[one]),/changed/);

  const missing=store({[MIRROR_KEY]:JSON.stringify([one])});
  result=await readLocalDrafts(missing);
  assert.equal(result.recovered,true);
  assert.equal(result.drafts[0].bride,'Asha');
  assert.equal(missing.values.get(PRIMARY_KEY),JSON.stringify([one]));
  const broken=store({[PRIMARY_KEY]:'broken json',[MIRROR_KEY]:JSON.stringify([one])});
  assert.equal((await readLocalDrafts(broken)).recovered,true);
  await assert.rejects(readLocalDrafts(store({[PRIMARY_KEY]:'broken json'})));
  const readError=store({[MIRROR_KEY]:JSON.stringify([one])});
  readError.getItem=async(key)=>{if(key===PRIMARY_KEY)throw new Error('I/O read failed');return readError.values.get(key)||null;};
  await assert.rejects(readLocalDrafts(readError),/I\/O read failed/);
  assert.equal(readError.values.has(PRIMARY_KEY),false);

  // A legitimate empty list stays empty even when a stale mirror still contains a draft.
  const empty=store({[PRIMARY_KEY]:'[]',[MIRROR_KEY]:JSON.stringify([one])});
  assert.deepEqual((await readLocalDrafts(empty)).drafts,[]);
  const fail=store({[PRIMARY_KEY]:JSON.stringify([one])});
  fail.setItem=async(key,value)=>{if(key===MIRROR_KEY)throw new Error('storage full');fail.values.set(key,value);};
  await assert.rejects(writeLocalDrafts(fail,[one],[]),/storage full/);
  assert.equal(fail.values.get(PRIMARY_KEY),JSON.stringify([one]));

  const copied=readBackupFile(makeBackupFile([one],'2026-11-19T00:00:00Z'));
  assert.equal(copied[0].message,one.message);
  assert.deepEqual(mergeBackup([one],[one,two]).drafts,[one,two]);
  assert.deepEqual(mergeBackup([one],[one,two]).added,1);
  assert.throws(()=>readBackupFile(JSON.stringify({format:'other',version:1,drafts:[one]})));
  assert.throws(()=>readBackupFile(JSON.stringify({format:'vivahsutra-invitations-backup',version:1,drafts:[{id:'bad',bride:4,groom:'ok'}]})));
  assert.throws(()=>readBackupFile(JSON.stringify({format:'vivahsutra-invitations-backup',version:1,drafts:[one,one]})));
  assert.throws(()=>readBackupFile('x'.repeat(2200000)));
  console.log('PASS: previous beta drafts remain readable, mirrored recovery, no stale writes, portable backup validation and non-destructive restore');
})().catch(error=>{console.error(error);process.exitCode=1;});
