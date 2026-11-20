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

## V1.1.6 draft retention and backup QA (NOT YET DEVICE-VERIFIED)
- [ ] In-place V1.1.5 → V1.1.6 install preserves an existing saved test draft.
- [ ] Export invitation JSON from Saved to Files/Drive and inspect that it exists.
- [ ] Restore exported JSON; duplicate IDs stay unchanged and invalid JSON is rejected.
- [ ] Save → force close → reopen persists; corrupted/missing primary recovers from on-device mirror (only if mirror already exists).
- [ ] Existing older missing invitation: root cause still unknown; pre-v1.1.6 versions stored no mirror and cannot be recovered solely from the repo.

## V1.1.7 opt-in on-device recovery (NOT YET DEVICE-VERIFIED)
- [ ] Saved → RECOVER FROM LOCAL COPY inspects the mirror without modifying a valid empty primary list
- [ ] Recovery dialogue shows the count of missing invitation IDs and explicitly requires owner confirmation
- [ ] Recovery appends only missing IDs, does not replace current saved drafts
- [ ] Empty/missing/corrupted recovery copy shows a useful error and does not overwrite data
- [ ] If writing recovered drafts fails, recovery snapshot remains available for another attempt
- [ ] Existing V1.1.5 data absent before the first mirror backup remains unrecoverable without another prior backup

## V1.1.8 protected local storage diagnostics — release candidate QA
- [x] Source tests block normal Save/Delete when recovery snapshot contains missing invitation IDs (CI unit tests)
- [x] Read-only primary/recovery status and counts omit names and invitation data (source and CI tests)
- [ ] Android screen shows CHECK LOCAL STORAGE, and its counts match a known saved sample
- [ ] Android refuses a regular Save while missing invitation IDs exist in local recovery copy, without overwriting that copy
- [ ] User-approved recovery adds only missing IDs, then normal saving can continue
- [ ] User device confirms all six selectable designs and four category filters
- [ ] User device confirms Hindi/English editor, optional photos, long names and Android keyboard
- [ ] User device confirms Save/Edit/Reopen, export/import JSON, front/back PNG and sharing
- [ ] Verify Play Protect behavior and accessibility on an actual supported Android device

**Cannot close without external/user action:** actual Android tests, signing with an owner-controlled production certificate, approved icon/splash, support contact and privacy policy, store delivery tests, merge authorization and APPLIQ publishing authorization. None of these is marked as complete from source checks alone.

## V1.1.9 PNG Save/Share validation
- [x] Source unit tests: simulated Gallery permission denial prevents file capture/save and returns a clear result
- [x] Source unit tests: simulated Android share unavailable prevents capture; invalid/remote PNG URI is rejected
- [x] Source unit tests: local file:// and absolute Android ViewShot temporary paths are accepted, with safe URI normalization
- [x] Source unit tests: simulated file save error, capture failure and sharing failure propagate to UI error handling
- [ ] Physical Android: Save FRONT PNG to Photos and open the actual resulting image
- [ ] Physical Android: Save BACK PNG to Photos and open the actual resulting image
- [ ] Physical Android: Share FRONT and BACK PNG to a receiving app or Files; ensure real files open and are not blank
- [ ] Physical Android: revoke Gallery permission and verify explicit Share PNG fallback without crash
- [ ] Physical Android: verify correct card text, Hindi characters, optional photos and FREE BETA watermark in exported pixels

**Caution:** Mock tests confirm control flow, not actual device Gallery permissions, Android share-sheet compatibility or pixel/render correctness. Avoid claiming PNG device PASS without a recording or physical test.

## V1.1.10 unfinished invitation navigation (source tests PASS; device QA pending)
- [x] Source-level checks verify Android Back and bottom tab transitions prompt when editor has unsaved changes
- [x] Source-level checks verify Home RESUME EDITING and Create tab resume unfinished invitation
- [ ] On Android, edit fields without saving → press device Back → Keep Editing and Leave Editor options behave correctly
- [ ] On Android, edit fields without saving → tap Home/Saved/Designs → warning appears; Home → RESUME EDITING preserves entered text
- [ ] On Android, edit fields without saving → tap bottom Create from another screen → same unfinished invitation reopens
- [ ] Save invitation → return Home; Resume Editing warning/banner no longer appears
- [ ] Force close after unsaved changes: no auto-draft persistence is implemented; do not claim protection across process termination

## V1.1.11 unfinished invitation persistence (device test pending)
- [x] Unit tests validate and serialize local working-copy saves and discard ordering, including failed writes
- [x] Source smoke checks cover startup restore, safe discard, recovery prompt and clearing after real Save
- [ ] Device: edit but do not Save → force close/reopen → RESTORE UNFINISHED INVITATION returns same sample details
- [ ] Device: save recovered invitation → force close/reopen → Saved contains it and no stale working-copy prompt remains
- [ ] Device: discard confirmation removes only the separate unfinished-work record, not saved invitations
- [ ] Device: bad/unreadable working-copy record is not silently overwritten; retry/discard action asks for consent
- [ ] Device: rapid typing then app backgrounding does not produce an obviously stale working copy
- [ ] Limit: app writes best-effort locally and cannot guarantee capture if Android force-kills it before the last write completes; no cloud backup exists

## V1.1.12 unfinished-work safety QA — source tested, Android NOT TESTED
- [x] Source CI rejects invalid working-copy format/oversized fields and serializes writes and clear operations
- [x] Source CI: corrupt/unreadable working copy blocks writes until a successful read or explicit clear
- [x] Source CI: UI checks for unreadable old copy and only autosaves when there is no pending restore candidate
- [x] Source CI: editor shows Saving locally / Saved locally / Error state, clearing it after successful Save
- [ ] Android phone: type sample invitation → wait for "saved locally" → force close → reopen → restore the exact same text
- [ ] Android phone: rapid typing and quick background/foreground does not restore stale text (best-effort)
- [ ] Android phone: saved invitation is in Saved with no stale unfinished copy offered after relaunch
- [ ] Android phone: test unreadable storage behavior on a controlled test environment; do NOT clear data or uninstall to simulate it
- [ ] Android phone: verify the new status text stays readable with keyboard open and a small screen

## V1.1.13 conditional working-copy cleanup
- [x] Mock unit test: stale Save cannot clear a newer queued unfinished message
- [x] Mock unit test: cleanup removes a matching working copy; no copy is an idempotent success
- [x] Mock unit test: cleanup is blocked for an unreadable working-copy record pending user review
- [ ] Device: rapid Save and subsequent edits cannot silently discard newer unfinished work
- [ ] Device: successful Save clears only a matching unfinished copy, without hiding regular Saved drafts
- [ ] Device: Home offers restore if newer unfinished changes were retained after Save
- [ ] Device: check behavior with Android Back, force close, and small screen (still not tested)

## V1.1.13 Gradle dependency-resolution failure and retry
- [x] Root cause from GitHub Actions run 44482370926: native Gradle step failed to resolve public Maven artifacts `kotlin-stdlib:2.2.21`, `kotlin-gradle-plugins-bom:2.1.20` and `java-diff-utils:4.15`; this is separate from JavaScript unit tests, which passed
- [x] Feature workflow now retries the Gradle APK build at most 3 times **only** for known dependency resolution/network failures, with `--refresh-dependencies` on retries; unrelated compilation failures still stop immediately
- [ ] Android APK rerun 44482943908 must complete SUCCESS, including APK identity/signature, public prerelease and upload artifact verification
- [ ] Physical Android installation/update and user-data retention verification remains required; CI cannot substitute for this
- [ ] Do not report V1.1.13 released until the public GitHub beta release contains an actual APK asset

## V1.1.14 save-time editor state and race regression
- [x] Source unit tests: finishing Save with unchanged text commits the saved snapshot and clears unsaved state
- [x] Source unit tests: new fields typed while Save is pending remain in the editor; a new local invitation keeps the assigned saved ID
- [x] Source smoke checks: edit revision captured at Save start, later changes remain unsaved, an active edit does not trigger a competing restore candidate
- [x] Source smoke checks: switching to another invitation while Save is pending is blocked
- [ ] Android device: type one message, tap Save and immediately change it; newer text must remain in Create and unsaved status must not disappear
- [ ] Android device: second Save updates the same invitation instead of creating a duplicate
- [ ] Android device: reopen app and verify latest saved details plus any separate, unfinished changes offered for recovery
- [ ] Android device: no regression to Back/Resume, JSON import/export, front/back PNG rendering and permissions

**Release gate:** GitHub CI PASS does not demonstrate Android behavior. Do not claim device QA complete or production signing ready without phone test evidence.

## V1.1.14 Android photo — 20 November 2026 (partial device evidence)
- [x] User-provided photo visibly shows **VivahSutra BETA V1.1.14** Home screen loaded on an Android phone, with branding, hero content and CREATE MY INVITATION control rendered
- [ ] Photo alone does not prove that CREATE MY INVITATION responds to a tap, designs can be selected, Saved data persists, recovery works, or PNG and JSON export succeed
- [ ] In-place update path and retention from the user's previous installed version to V1.1.14 are not demonstrated by this single photo
- [ ] Bright vertical green lines extend through the OS status bar and app. Similar lines appeared in earlier launcher footage. Likely phone-display issue, but root cause is not established by the photo; no app-only rendering issue proven
- [x] Independently, GitHub Actions APK build #44683994445 completed successfully and published public prerelease `vivahsutra-android-beta-r297` (build 100297). This is automated CI evidence, not device functional QA
