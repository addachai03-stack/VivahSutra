# VivahSutra Android — Device QA and APPLIQ release gate

Status: **NOT YET TESTED ON A PHYSICAL ANDROID DEVICE**. A GitHub Actions compile is not proof of functional correctness.

## APK build
- [ ] GitHub Actions `Android APK — VivahSutra` succeeds on the latest PR commit
- [ ] Artifact `VivahSutra-Android-Test-APK` exists and is nonempty
- [ ] Install on an Android phone (test-only APK, not a production signed release)
- [ ] Cold launch and reopen without crashes

## Royal entrance
- [ ] Both ornate door panels visibly open outward without flicker
- [ ] Intro finishes in ~2–3 seconds
- [ ] Skip Intro responds immediately
- [ ] Android Back does not trap the user in the intro

## Core screens
- [ ] Home, Designs, Create and Saved tabs open and respond
- [ ] All six templates appear and are selectable
- [ ] Filter Royal / Floral / Traditional / Modern works
- [ ] No clipped cards on a narrow Android phone
- [ ] Android keyboard does not prevent editing text fields

## Invitation editing
- [ ] Names, occasion, date, time, venue, family, RSVP and message update preview
- [ ] Hindi labels and Devanagari text display correctly
- [ ] Front and Back preview show correct information
- [ ] Bride/groom photo selection and removal work
- [ ] App does not request unrelated permissions

## Drafts and export
- [ ] Save, edit, relaunch, and reopen a draft retains changes
- [ ] Delete requires confirmation and removes only the selected local draft
- [ ] PNG save creates a readable image in Photos
- [ ] Share opens Android share sheet with a readable PNG
- [ ] Exported image includes the FREE BETA watermark
- [ ] Permission denied and storage full produce a useful error
- [ ] No existing website/browser data are modified

## APPLIQ release gate — separate explicit approval required
- [ ] Replace beta placeholder art with final icon/splash
- [ ] Test accessibility, small screens, offline behavior and app size
- [ ] Create release signing key and securely retain it (do not commit secrets)
- [ ] Build and verify production-signed APK or AAB as required by APPLIQ
- [ ] Verify APPLIQ file upload, delivery and listing are operational
- [ ] Confirm privacy disclosures and support contact
- [ ] Obtain owner approval to merge PR
- [ ] Obtain separate owner approval to publish in APPLIQ

## Known caveats
- The old GitHub Pages website is not an Android application and must remain untouched.
- Existing website localStorage drafts are not migrated into the app.
- Local drafts are not cloud-backed; clearing app data or uninstalling can erase them.
- iOS is out of scope for this Android-first PR.
