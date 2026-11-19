// Testable native PNG export coordinator for VivahSutra.
// No network or external uploads; saving uses Android media library, sharing the OS sheet.
async function exportInvitationPng({ action, capture, sharing, mediaLibrary }) {
  if (action !== 'save' && action !== 'share') {
    throw new Error('Unknown PNG export action');
  }
  if (typeof capture !== 'function') throw new Error('PNG capture is not available');
  if (action === 'share') {
    if (!sharing || typeof sharing.isAvailableAsync !== 'function' || !await sharing.isAvailableAsync()) {
      return {status:'share-unavailable'};
    }
  }
  if (action === 'save') {
    if (!mediaLibrary || typeof mediaLibrary.requestPermissionsAsync !== 'function') {
      throw new Error('Media library is not available');
    }
    const permission = await mediaLibrary.requestPermissionsAsync(true, ['photo']);
    if (!permission || permission.granted !== true) {
      return {status:'permission-denied'};
    }
  }
  const captured = await capture();
  // Android ViewShot usually returns file:// but some implementations use an
  // absolute filesystem path. Expo Sharing expects a file URI.
  if (typeof captured !== 'string' ||
      !(captured.startsWith('file://') || captured.startsWith('/')) ||
      !/\.png(?:$|\?)/i.test(captured)) {
    throw new Error('PNG capture did not produce a local .png file');
  }
  const uri = captured.startsWith('file://') ? captured : 'file://' + captured;
  if (action === 'share') {
    await sharing.shareAsync(uri, {
      mimeType:'image/png',
      dialogTitle:'Share your VivahSutra invitation PNG'
    });
    return {status:'shared'};
  }
  await mediaLibrary.createAssetAsync(uri);
  return {status:'saved'};
}
module.exports = {exportInvitationPng};
