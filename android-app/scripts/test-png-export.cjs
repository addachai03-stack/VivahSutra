const assert=require('node:assert/strict');
const {exportInvitationPng}=require('../src/pngExport');

(async()=>{
  const events=[];
  const sharing={
    isAvailableAsync:async()=>{events.push('share-check');return true;},
    shareAsync:async(uri, options)=>{events.push(['share',uri,options]);}
  };
  const mediaLibrary={
    requestPermissionsAsync:async(writeOnly,granular)=>{
      events.push(['permission',writeOnly,granular]);
      return {granted:true};
    },
    createAssetAsync:async(uri)=>{events.push(['save',uri]);return {id:'image'};}
  };
  const capture=async()=>{events.push('capture');return 'file:///data/user/0/app/cache/invite.png';};

  assert.deepEqual(await exportInvitationPng({action:'save',capture,sharing,mediaLibrary}),{status:'saved'});
  assert.deepEqual(events,[['permission',true,['photo']],'capture',['save','file:///data/user/0/app/cache/invite.png']]);
  events.length=0;

  assert.deepEqual(await exportInvitationPng({action:'share',capture,sharing,mediaLibrary}),{status:'shared'});
  assert.deepEqual(events[0],'share-check');
  assert.equal(events[1],'capture');
  assert.equal(events[2][0],'share');
  assert.equal(events[2][2].mimeType,'image/png');
  events.length=0;

  assert.deepEqual(await exportInvitationPng({
    action:'save',
    capture:async()=>'/data/user/0/app/cache/invite.png',
    mediaLibrary
  }),{status:'saved'});
  assert.deepEqual(events[events.length-1],['save','file:///data/user/0/app/cache/invite.png']);
  events.length=0;

  const denied={
    requestPermissionsAsync:async()=>({granted:false}),
    createAssetAsync:async()=>{throw new Error('MUST NOT SAVE');}
  };
  assert.deepEqual(await exportInvitationPng({action:'save',capture:async()=>{throw new Error('MUST NOT CAPTURE');},mediaLibrary:denied}),{status:'permission-denied'});
  assert.deepEqual(await exportInvitationPng({
    action:'share',capture:async()=>{throw new Error('MUST NOT CAPTURE');},
    sharing:{isAvailableAsync:async()=>false,shareAsync:async()=>{throw new Error('MUST NOT SHARE');}}
  }),{status:'share-unavailable'});

  for (const bad of [null,'','https://example.com/img.png','content://evil.png','file:///tmp/capture.jpg','random.png']) {
    await assert.rejects(exportInvitationPng({action:'save',capture:async()=>bad,mediaLibrary}),/local \.png/);
  }
  await assert.rejects(exportInvitationPng({action:'oops',capture,sharing,mediaLibrary}),/Unknown PNG export/);
  await assert.rejects(exportInvitationPng({action:'save',capture:null,mediaLibrary}),/capture is not available/);
  await assert.rejects(exportInvitationPng({
    action:'save',capture:async()=>{throw new Error('simulated native capture failed');},mediaLibrary
  }),/simulated native capture failed/);
  await assert.rejects(exportInvitationPng({
    action:'save',capture,mediaLibrary:{
      requestPermissionsAsync:async()=>({granted:true}),
      createAssetAsync:async()=>{throw new Error('disk full');}
    }
  }),/disk full/);
  await assert.rejects(exportInvitationPng({
    action:'share',capture,sharing:{
      isAvailableAsync:async()=>true,
      shareAsync:async()=>{throw new Error('share target rejected');}
    }
  }),/share target rejected/);
  console.log('PASS: PNG Save/Share mock tests, local path normalization, permission denial, invalid URI, native failure and I/O error');
})().catch(error=>{console.error(error);process.exitCode=1;});
