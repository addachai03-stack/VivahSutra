# VivahSutra Android — Device QA and APPLIQ release gate

Status: **PARTIALLY TESTED ON A PHYSICAL ANDROID DEVICE**. User-supplied Android phone footage shows the app running and navigating among screens, but does not establish that all functions pass. GitHub Actions checks and an APK build are not substitutes for on-device tests.

## APK build
- [ ] V1.1.4 to V1.1.5 in-place beta upgrade tested on Android, with no loss of drafts
- [ ] In-app Check for Updates offers verified newer GitHub beta and download works; prompts require Android user approval
- [ ] Invalid beta release package/build/checksum metadata rejected by automated unit tests
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
- [x] Gallery design cards render and scroll on V1.1.2 Android phone footage (individual selection of all six is not verified)
- [ ] Tap-to-select, selected gold border/checkmark and persistent Continue button work on V1.1.3 Android phone (new source code pending device test)
- [ ] All six templates individually selectable, and selected design opens correctly in editor
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
- In 18 November 2026 phone footage, BETA V1.1.1 Home, Designs, Create and Saved loaded, but Designs showed a 6/6 count with no visible cards. The gallery's flex-basis zero / wrapping layout was changed to explicit full-width vertical cards in V1.1.2. V1.1.2 device footage subsequently confirmed cards and scrolling, but not all six individually selected. V1.1.3 adds an explicit selection/highlight/Continue flow; that new flow is NOT YET device-verified.
- Preview can scroll horizontally if the 300px invitation does not fit in a narrow editor panel.
- Save/Share UI states explicitly that only the selected front or back side is exported.
- Saving is blocked until the existing local drafts have finished loading, preventing an early write from overwriting data.
- Six-template smoke checks run as part of the Android APK workflow.
- Green display lines are also visible on the Android launcher's home screen in the user-provided footage, so the footage does not support treating those lines as an app-only rendering defect.
