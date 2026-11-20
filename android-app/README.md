# VivahSutra — native Android app (Expo / React Native)
This is a separate Android-first application (Expo SDK 57 / Android API 36). The existing GitHub Pages website in the repository root remains untouched.

## Included in v1.1.8 beta
- Animated royal double-door entrance with a Skip Intro control (no external media needed)
- Home / Designs / Create / My Invitations bottom navigation
- Six new mobile invitation themes and four accent colours
- Wedding, Engagement, Haldi, Mehendi, Sangeet, Reception, Save the Date
- Edit invitation details, optional bride and groom photos, front/back preview
- Local device draft saving, PNG export to Photos and native file sharing
- No account, payment, AI or network required for the invitation creation/export flow. Beta update checks need internet.

## Run
```sh
cd android-app
npm install
npx expo start
```
Use Expo Go for development where compatible. For an actual standalone Android test APK, the GitHub Actions workflow **Android APK — VivahSutra** runs automated source-level checks, Expo prebuild, then Gradle assembleRelease with a **debug-signing key**. This build is for testing only, **not** a production-signed app. APPLIQ listing is a separate process.

## Important notes
- The prior website's localStorage drafts do **not** sync into this app. No existing user data are deleted.
- App drafts/photos are local only. App removal or clearing storage may delete them.
- PNG output includes a **FREE BETA** watermark; no paid feature is represented as active.
- Photos never leave the device. Android image library and media permission handling should be QA-tested.
- No production release signing, app-store publication, or APPLIQ upload is performed automatically.
- An older test APK was installed and recorded on an Android device; latest v1.1.6 patches (Hindi editor, local storage safety, accessibility, export layout) **still require fresh device retesting**. A successful CI build does not verify runtime features.

## Upgrading your existing test APK safely
1. Use the latest successful workflow run from the feature branch; download `VivahSutra-Android-Test-APK` from **Artifacts**.
2. Try installing the new APK **over** the existing VivahSutra app. The package is `com.vivahsutra.invites`; GitHub beta CI builds use Android versionCodes above 100000, increasing for every successful run.
3. **Do not uninstall or clear app storage** to resolve an installation conflict without first protecting any local invitation drafts. They are not cloud-backed or migrated.
4. Test all six templates, editing in Hindi, Save/Edit/Reopen, optional photos, and front/back PNG save and share on the actual phone. The exported image has a FREE BETA watermark.
5. The test APK is **not** production-signed. For store distribution, see `../APPLIQ_ANDROID_RELEASE_PREP.md`; production signing and APPLIQ publishing need separate explicit approval.

## Automated smoke checks
Run `npm run test:smoke` from `android-app/` (requires Node.js). The same tests run before each GitHub APK build. They check source/config invariants only and cannot simulate actual photo permissions, device persistence, PNG generation or user interactions.

- The app header displays `BETA V1.1.8` to help identify the newly installed test build.

## Android beta updates — no more iPhone-to-Android APK forwarding
- The APK built from `feature/native-android-v1` checks public GitHub beta releases at app startup, and when returning to the foreground after 30 minutes.
- Use Home → **CHECK FOR UPDATES** to check manually. A visible banner and **DOWNLOAD UPDATE** appear whenever a newer beta build is available.
- Tapping Download opens the verified GitHub APK asset in Android's browser; the user must permit Android to install/update the APK. **There is no silent installation.**
- The GitHub Actions push build tests the source, assigns a monotonically increasing Android `versionCode`, verifies the APK signature, then publishes a public GitHub **prerelease** asset called `VivahSutra-Android-Beta.apk`.
- Update feed: `https://api.github.com/repos/addachai03-stack/VivahSutra/releases?per_page=20`. Only signed test APKs from matching `vivahsutra-android-beta-r<number>` tags and this repo are accepted as candidates.
- **One-time bootstrap**: Older APKs (1.1.3 or earlier) do not contain the updater. Install the first successful 1.1.4 beta update APK over the existing app once; later builds can be downloaded from inside the app.
- These beta assets and version metadata are **publicly accessible**. The update check contacts GitHub, but does not upload invitation content or photos.
- The APKs use the development/debug test signing certificate, not a permanent production key. Release signing, APPLIQ app-store integration and OTA JavaScript updates are **separate future work** requiring explicit approval.
- Never uninstall or clear app storage to fix update failures. Existing locally saved drafts could be lost.

## Invitation backup and recovery (v1.1.6)
- Original AsyncStorage key `vivahsutra-native-drafts-v1` remains unchanged to read older beta drafts.
- Saving maintains an additional on-device recovery copy. A missing or malformed primary list can be recovered from a valid mirror. A readable empty list is not automatically overwritten.
- Save/delete writes are guarded against concurrent and stale storage changes.
- Saved → **EXPORT BACKUP FILE** lets the user share a JSON backup to Files or Drive. It includes personal invitation details, so keep it private; no automatic cloud upload.
- Saved → **RECOVER FROM LOCAL COPY** checks the current on-device snapshot for missing invitation IDs, asks for confirmation, and adds them without replacing existing drafts. A deliberately deleted draft could also be found in an older snapshot; this action is opt-in.
- Saved → **RESTORE BACKUP FILE** imports a previously exported JSON and adds missing invitation IDs without overwriting existing drafts. Photos are local paths, not embedded, and may need reselection.
- A valid empty primary list is never automatically replaced by a stale recovery snapshot. The user must approve RECOVER FROM LOCAL COPY.
- Local mirrors do not survive uninstall or clearing app data. Data already missing before recovery existed cannot be restored without an earlier exported backup.
- Export, restore, and retained drafts must still be verified on an actual Android phone.

## V1.1.8 troubleshooting — device-only storage check
- Saved → **CHECK LOCAL STORAGE** shows only local storage key status, number of drafts, recovery copy status and missing ID count. It does **not** display names or send anything to a server.
- If a snapshot has missing IDs, regular save/delete and JSON import are stopped with a recovery warning rather than silently overwriting that snapshot.
- Use **RECOVER FROM LOCAL COPY** only after reviewing the confirmation. A truly deleted draft may also be present in an older snapshot.
- These checks cannot restore drafts missing from both the primary storage and the recovery mirror; an earlier exported backup file is needed in that case.
- Status/counts and all export/restore flows still need on-device QA.

## V1.1.10 navigation improvements
- Unsaved edits in Create trigger a prompt when leaving with Android Back or another bottom tab.
- Leaving the editor temporarily does not delete its in-memory state; Home shows **RESUME EDITING**, and bottom Create reopens the unfinished invitation.
- Use **SAVE MY INVITATION** to persist data to private local storage. Unsaved changes are NOT automatically saved when the app is force-closed.
- These interactions are source-checked by CI but still require Android device testing.

## V1.1.11 local unfinished-work recovery
- While a user edits an invitation, a separate local working copy is written through a serialized queue; it does not overwrite normal Saved drafts or their recovery mirror.
- If the app is reopened with an unfinished working copy, Home offers **RESTORE UNFINISHED INVITATION**. Recovery needs a user tap; otherwise the saved list is untouched.
- Creating another invitation while work remains asks for discard confirmation; a completed **SAVE MY INVITATION** removes the working copy only after the normal saved draft write succeeded.
- If the unfinished-work record is unreadable, Home offers Retry and a separate explicit Discard option. Never clear app data to address this.
- Working-copy persistence is best-effort and local only. The latest keystroke might not be saved if Android kills the app before the pending storage write finishes.
- The working copy does not migrate between phones or survive uninstall/clear data. Export normal Saved drafts to a user-controlled JSON file for long-term backup.

## V1.1.13 Save-safe unfinished working copy
- A completed Saved invitation and a separate unfinished working copy are different records.
- When normal Save finishes, the unfinished copy is cleared only if it still matches the invitation content submitted for saving. If later keystrokes were already written, the new working copy is preserved and Home can offer a recovery choice.
- Corrupt or unreadable unfinished records cannot be silently overwritten; explicit user recovery or discard is required.
- This does not guarantee the last keystroke if Android kills the process before the device storage write completes.
- Unit tests exercise write ordering and conditional cleanup; verify real-device behavior before marking Android QA PASS.

## V1.1.14 editor safety
- Saving captures the current editing revision. The latest text typed while an asynchronous Save is running is kept in the editor instead of being overwritten with the older saved snapshot.
- A new invitation receives its persisted ID even if the editor has newer unsaved changes, so Save Again edits the same invitation.
- When editing continues, the active editor remains authoritative; a separate recovery candidate is offered only when there is no newer in-memory edit.
- Switching to another invitation while Save is in progress is blocked.
- CI unit/source checks cover this logic; real Android device acceptance is still required.

## V1.1.16 strict portable backup validation
- JSON backups shared by the user are **untrusted input**. Import accepts the documented version 1 backup shape and allowed invitation fields, rejecting extra object keys and malformed metadata.
- Import rejects remote photo URLs, so restoring JSON cannot make invitation images load a third-party website. Normal locally created photo paths remain supported.
- This stricter validation does not change the historical on-device saved-invitation key or migrate/erase existing data.
- User-selected backup restore still requires confirmation and merges by ID; photo files are not embedded in JSON backups.
- Unit tests pass for compatible exports and malformed inputs, while physical Android import/export tests remain pending.

## V1.1.17 damaged recovery-mirror repair
- Saved → CHECK LOCAL STORAGE reports whether the primary Saved list and second on-device mirror are readable. It does not expose invitation names.
- When the primary list is valid but the mirror is invalid, Saved offers **REPAIR LOCAL RECOVERY COPY** with an explicit confirmation.
- Repair preserves the exact unreadable mirror bytes in `vivahsutra-native-drafts-v1-recovery-quarantine`, verifies preservation, and then rebuilds the mirror from the primary Saved list. It never deletes Saved invitations.
- If a different quarantine already exists, or the primary list is invalid, repair refuses to overwrite unknown data.
- The quarantine is local-only and does not survive app uninstall/clear data. Export a private JSON backup to Files before intentional repair.
- Source unit checks pass; physical Android behavior is not yet verified.
