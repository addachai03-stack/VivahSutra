# VivahSutra Android — Device QA and APPLIQ release gate

Status: **PARTIALLY TESTED ON A PHYSICAL ANDROID DEVICE**. User-supplied Android phone footage shows the app running and navigating among screens, but does not establish that all functions pass. GitHub Actions checks and an APK build are not substitutes for on-device tests.

## APK build
Evidence: 19 November 2026 user-supplied 71-second Android phone video. Recording shows built-in V1.1.4 update prompt, GitHub browser APK download, Android installer and Play Protect, V1.1.5 reopening, Home update check and Designs/Saved navigation. PASS here means **visible in recording**, not automated device-instrumentation tests.
- [x] V1.1.4 (100127) → V1.1.5 (100143) APK downloaded and installed via Android phone, app reopened on V1.1.5 (71s user footage)
- [ ] Existing saved drafts survive in-place update (NOT verified: post-update Saved screen was empty; recording did not establish a pre-update saved draft)
- [x] V1.1.4 offered V1.1.5 build 100143 in-app; Download opened browser and APK downloaded; Android prompts and Google Play Protect scan shown; App Installed appeared
- [x] Post-update V1.1.5 Home → Check for Updates reported 'App is up to date'
- [x] Invalid beta release package/build/checksum metadata rejected by source-level unit tests (GitHub Actions PASS; not a full Android security audit)
- [ ] GitHub Actions `Android APK — VivahSutra` succeeds on the latest PR commit
- [ ] Artifact `VivahSutra-Android-Test-APK` exists and is nonempty
- [x] Install an earlier test APK on an Android phone (recorded footage provided; latest build needs reinstall)
- [x] New V1.1.5 app launches after update and Home/Designs/Saved/Create navigation appears without visible crash in provided recording

## Royal entrance
- [ ] Both ornate door panels visibly open outward without flicker
- [ ] Intro finishes in ~2–3 seconds
- [ ] Skip Intro responds immediately
- [ ] Android Back does not trap the user in the intro

## Core screens
- [x] Home, Designs, Create and Saved screens shown during earlier phone test (current build still needs retest)
- [x] Gallery design cards render and scroll on V1.1.2 Android phone footage (individual selection of all six is not verified)
- [ ] Tap-to-select, gold checkmark and Continue navigation fully verified: V1.1.5 video shows Select Design First button and a design card, but no successful selection/Continue action
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
