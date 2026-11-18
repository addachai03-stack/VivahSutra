// Public, read-only beta update feed. No account, permissions or native installer needed.
// Only APK assets from this repository's named GitHub prereleases are trusted.
const OWNER_REPO = 'addachai03-stack/VivahSutra';
const API_URL = 'https://api.github.com/repos/' + OWNER_REPO + '/releases?per_page=20';
const APK_NAME = 'VivahSutra-Android-Beta.apk';
const TAG_PREFIX = 'vivahsutra-android-beta-r';
const DOWNLOAD_PREFIX = 'https://github.com/' + OWNER_REPO + '/releases/download/';

function parseBetaRelease(release) {
  if (!release || release.draft || release.prerelease !== true) return null;
  const match = new RegExp('^' + TAG_PREFIX + '([1-9][0-9]*)$').exec(release.tag_name || '');
  if (!match) return null;
  const runNumber = Number(match[1]);
  const versionCode = 100000 + runNumber;
  if (!Number.isSafeInteger(versionCode) || versionCode > 2147483647) return null;
  const asset = (Array.isArray(release.assets) ? release.assets : []).find(a =>
    a.name === APK_NAME &&
    a.state === 'uploaded' &&
    Number(a.size) > 1000000 &&
    a.browser_download_url === DOWNLOAD_PREFIX + release.tag_name + '/' + APK_NAME
  );
  if (!asset) return null;
  const nameMatch = String(release.body || '').match(/^Version-Name:\s*([0-9]+\.[0-9]+\.[0-9]+)\s*$/mi);
  const versionName = nameMatch ? nameMatch[1] : 'new beta';
  return { versionCode, versionName, apkUrl: asset.browser_download_url, releaseUrl: release.html_url || null };
}

async function checkForBetaUpdate(installedBuild, fetcher) {
  const response = await fetcher(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response || !response.ok) throw new Error('Could not reach the beta update feed');
  const releases = await response.json();
  if (!Array.isArray(releases)) throw new Error('Unexpected beta update response');
  const candidates = releases.map(parseBetaRelease).filter(Boolean);
  if (!candidates.length) return { status: 'unavailable' };
  candidates.sort((a, b) => b.versionCode - a.versionCode);
  const latest = candidates[0];
  if (!Number.isSafeInteger(installedBuild) || installedBuild < 0) {
    return { status: 'unknown-build' };
  }
  return latest.versionCode > installedBuild
    ? { status: 'available', ...latest }
    : { status: 'current', ...latest };
}

module.exports = { API_URL, APK_NAME, TAG_PREFIX, parseBetaRelease, checkForBetaUpdate };
