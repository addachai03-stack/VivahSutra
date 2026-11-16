# VivahSutra Android — Device QA and APPLIQ release gate

Status: **PARTIALLY TESTED ON A PHYSICAL ANDROID DEVICE**. User-supplied Android phone footage shows the app running and navigating among screens, but does not establish that all functions pass. GitHub Actions checks and an APK build are not substitutes for on-device tests.

## APK build
- [ ] GitHub Actions `Android APK — VivahSutra` succeeds on the latest PR commit
- [ ] Artifact `VivahSutra-Android-Test-APK` exists and is nonempty
- [x] Install an earlier test APK on an Android phone (recorded footage provided; latest build needs reinstall)
- [ ] Cold launch and reopen without crashes

## Royal entrance
- [ ] Both ornate door panels visibly open outward without flicker
- [ ] Intro finishes in ~2–3 seconds
- [ ] Skip Intro responds immediately
- [ ] Android Back does not trap the user in the intro

## Core screens
- [x] Home, Designs, Create and Saved screens shown during earlier phone test (current build still needs retest)
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

## Latest source-level QA improvements (not yet device-verified)
- Preview can scroll horizontally if the 300px invitation does not fit in a narrow editor panel.
- Save/Share UI states explicitly that only the selected front or back side is exported.
- Saving is blocked until the existing local drafts have finished loading, preventing an early write from overwriting data.
- Six-template smoke checks run as part of the Android APK workflow.
- Green display lines are also visible on the Android launcher's home screen in the user-provided footage, so the footage does not support treating those lines as an app-only rendering defect.
