const assert = require('node:assert/strict');
const { API_URL, APK_NAME, parseBetaRelease, checkForBetaUpdate } = require('../src/betaUpdateFeed');
const repo = 'addachai03-stack/VivahSutra';
function release(run, overrides = {}) {
  const tag_name = 'vivahsutra-android-beta-r' + run;
  const checksum = 'a'.repeat(64);
  return {
    tag_name, draft: false, prerelease: true,
    html_url: 'https://github.com/' + repo + '/releases/tag/' + tag_name,
    body: 'Version-Name: 1.1.5\nBuild-Code: ' + (100000 + run) +
      '\nPackage: com.vivahsutra.invites\nAPK-SHA256: ' + checksum,
    assets: [{ name: APK_NAME, size: 70000000, state: 'uploaded', digest: 'sha256:' + checksum,
      browser_download_url: 'https://github.com/' + repo + '/releases/download/' + tag_name + '/' + APK_NAME }],
    ...overrides,
  };
}
function fetcher(items) {
  return async (url) => { assert.equal(url, API_URL); return {ok:true,json:async()=>items}; };
}
(async()=>{
  assert.equal(parseBetaRelease(release(14)).versionCode, 100014);
  assert.equal(parseBetaRelease(release(14, {draft:true})), null);
  assert.equal(parseBetaRelease(release(14, {prerelease:false})), null);
  assert.equal(parseBetaRelease(release(14, {tag_name:'not-beta'})), null);
  assert.equal(parseBetaRelease(release(14, {assets:[]})), null);
  assert.equal(parseBetaRelease(release(14, {body:'Version-Name: 1.1.5\\nBuild-Code: 100013\\nPackage: com.vivahsutra.invites\\nAPK-SHA256: ' + 'a'.repeat(64)})), null);
  assert.equal(parseBetaRelease(release(14, {body:'Version-Name: 1.1.5\\nBuild-Code: 100014\\nPackage: other.app\\nAPK-SHA256: ' + 'a'.repeat(64)})), null);
  assert.equal(parseBetaRelease(release(14, {body:'Version-Name: 1.1.5\\nBuild-Code: 100014\\nPackage: com.vivahsutra.invites'})), null);
  assert.equal(parseBetaRelease(release(14, {assets:[{name:APK_NAME,size:70000000,state:'uploaded',digest:'sha256:'+'b'.repeat(64),browser_download_url:'https://github.com/'+repo+'/releases/download/vivahsutra-android-beta-r14/'+APK_NAME}]})), null);
  assert.equal(parseBetaRelease(release(14, {assets:[{name:APK_NAME,size:90000000,state:'uploaded',browser_download_url:'https://evil.example/installer.apk'}]})), null);
  assert.equal((await checkForBetaUpdate(100010,fetcher([release(12),release(14),release(13)]))).versionCode,100014);
  assert.equal((await checkForBetaUpdate(100014,fetcher([release(14)]))).status,'current');
  assert.equal((await checkForBetaUpdate(100020,fetcher([release(14)]))).status,'current');
  assert.equal((await checkForBetaUpdate(100000,fetcher([]))).status,'unavailable');
  assert.equal((await checkForBetaUpdate(-1,fetcher([release(14)]))).status,'unknown-build');
  await assert.rejects(checkForBetaUpdate(10, async()=>({ok:false})));
  console.log('PASS: beta releases, version comparison, asset URL allowlist and offline/error cases');
})().catch(e=>{console.error(e);process.exitCode=1;});
