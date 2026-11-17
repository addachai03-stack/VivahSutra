# VivahSutra v1.1.1 — Android phone test guide (Hinglish)

**Only test after the latest feature-branch APK build is successful.** This guide is for real-device checks, not proof they already passed.

## Before install
1. GitHub → **Actions → Android APK — VivahSutra** → open the latest *successful* run for `feature/native-android-v1`.
2. **Artifacts → VivahSutra-Android-Test-APK**, download ZIP, extract and install the APK.
3. **Old VivahSutra ko uninstall mat karna** if you have saved invitations. First try installing the newer APK over the existing app. Clearing app storage/uninstalling may permanently remove local invitations. If Android reports a signature conflict, stop and report it instead of deleting data.

## Real-device pass checklist
- [ ] **Installed build:** app header must show `BETA V1.1.1`; if not, you are still testing an older APK.
- [ ] **Royal intro:** app launch, doors open, Skip works; repeat after reopening.
- [ ] **Tabs:** Home / Designs / Create / Saved all tap/open; Android Back works.
- [ ] **Design collection:** All = 6; Royal = 2; Floral = 2; Traditional = 1; Modern = 1. Open and customise at least one from each category.
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
