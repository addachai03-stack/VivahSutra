 # VivahSutra v1.1.6 — Android phone test guide (Hinglish)

**Only test after the latest feature-branch APK build is successful.** This guide is for real-device checks, not proof they already passed.

## Before install
1. GitHub → **Actions → Android APK — VivahSutra** → open the latest *successful* run for `feature/native-android-v1`.
2. **Artifacts → VivahSutra-Android-Test-APK**, download ZIP, extract and install the APK.
3. **Old VivahSutra ko uninstall mat karna** if you have saved invitations. First try installing the newer APK over the existing app. Clearing app storage/uninstalling may permanently remove local invitations. If Android reports a signature conflict, stop and report it instead of deleting data.

## Real-device pass checklist
- [ ] **Beta update bootstrap:** install the first updater-enabled V1.1.4 APK *over* the old app, and verify saved invitations still exist. Note installed Android build number shown in Home.
- [ ] **Check for Updates:** Home has the button; it reports latest beta or a clear offline error without app crash.
- [ ] **V1.1.4 → V1.1.5 update test:** from the first updater APK (V1.1.4 / build 100127), open Home → Check for Updates. Newer v1.1.5 public beta should be offered after its GitHub release succeeds; tapping Download from the prompt should open the APK download link in Android's browser. Allow Android install only after reading the update prompt.
- [ ] **Untrusted release metadata:** update checker must reject releases whose package, build number or APK checksum do not match the GitHub beta asset (verified in CI unit tests; not a device UI test).
- [ ] **No silent update:** Android requires user action; existing saved drafts remain after successful in-place upgrade.
- [ ] **Offline:** update check gracefully fails; invitation creation, local save, and export continue to work.
- [ ] **Installed build:** app header must show `BETA V1.1.6` on the newest build; `BETA V1.1.4` contains the first update checker.
- [ ] **Royal intro:** app launch, doors open, Skip works; repeat after reopening.
- [ ] **Tabs:** Home / Designs / Create / Saved all tap/open; Android Back works.
- [ ] **Design collection (gallery visible in V1.1.2 phone footage):** All = 6; Royal = 2; Floral = 2; Traditional = 1; Modern = 1. SIX actual cards must be visibly rendered below the filter row; scroll downward and tap at least one from each category. A displayed count alone is NOT a pass.
- [ ] **Select option (NEW):** Tap a Royal card → gold border + ✓ SELECTED shows; the fixed bottom button becomes active; tap **CONTINUE WITH SELECTED DESIGN** → editor opens using the same design. Change filter and select another card; selection should reset. Back in editor, select a new design chip and confirm preview changes while typed fields remain.
- [ ] **Small screen:** no design cards obscured; invitation preview scrolls sideways if phone is narrower than preview; bottom Save/Share buttons are usable.
- [ ] **Language:** switch English to हिन्दी in editor, confirm Hindi field labels appear; type Hindi names and family line; inspect preview for missing glyphs.
- [ ] **Fields:** edit couple names, date, time, venue, message and RSVP; preview reflects entered data. Try a long name and multiline message.
- [ ] **Photos:** select photo for each person, check local preview, then Remove; denied selection or cancel should not break the app.
- [ ] **Draft:** Save → Saved → Open/Edit → Save → force close/reopen → Saved retains latest changes; delete one draft only after confirmation.
- [ ] **Save safety:** edit a draft then choose a new template; unsaved-changes warning should appear. Tap Save repeatedly to confirm duplicate drafts are not created.
- [ ] **Front PNG:** select Front → Save Front PNG; open Gallery and inspect image + FREE BETA watermark.
- [ ] **Back PNG:** select Back → Save Back PNG; inspect correct family/RSVP information and watermark.
- [ ] **Share PNG:** Android share sheet opens with actual PNG, and receiving app can open it; test with a non-sensitive sample.
- [ ] **Permissions:** if the phone offers permission choices, deny once; app should show error and not crash. Retry with access allowed.
- [ ] **Offline:** turn off mobile data/Wi-Fi and repeat preview, editing, local Save and PNG export.

## If something fails
Send a screen recording/photo of the relevant step plus the Android version and the GitHub run number. Avoid recording personal wedding phone numbers, names or family details; use test data.

## Release warning
This is a **FREE BETA TEST APK with debug signing**, not an APPLIQ production release. Store publishing and PR merge need separate approvals.

## Backup & recovery acceptance test for V1.1.6
- Install V1.1.6 *over* V1.1.5; do not uninstall or clear app storage.
- Before creating new drafts, inspect Saved for any old drafts. Empty Saved does not prove recovery; V1.1.5 did not create a recovery mirror.
- Save a sample invitation → close app → reopen Saved. The draft should remain.
- Saved → EXPORT BACKUP FILE → choose Android Files or Drive; verify a .json file exists and keep it private.
- Saved → RESTORE BACKUP FILE → select the exported JSON; existing invitations must not be overwritten and duplicate IDs should be skipped.
- Photos are not embedded in JSON backups and might require reselection after reinstall.
- Corrupt/unreadable local storage must block Save/Delete, not silently replace existing data.
