# VivahSutra — native Android app (Expo / React Native)
This is a separate Android-first application (Expo SDK 57 / Android API 36). The existing GitHub Pages website in the repository root remains untouched.

## Included in v1.1.4 beta
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
- An older test APK was installed and recorded on an Android device; latest v1.1.4 patches (Hindi editor, local storage safety, accessibility, export layout) **still require fresh device retesting**. A successful CI build does not verify runtime features.

## Upgrading your existing test APK safely
1. Use the latest successful workflow run from the feature branch; download `VivahSutra-Android-Test-APK` from **Artifacts**.
2. Try installing the new APK **over** the existing VivahSutra app. The package is `com.vivahsutra.invites`; GitHub beta CI builds use Android versionCodes above 100000, increasing for every successful run.
3. **Do not uninstall or clear app storage** to resolve an installation conflict without first protecting any local invitation drafts. They are not cloud-backed or migrated.
4. Test all six templates, editing in Hindi, Save/Edit/Reopen, optional photos, and front/back PNG save and share on the actual phone. The exported image has a FREE BETA watermark.
5. The test APK is **not** production-signed. For store distribution, see `../APPLIQ_ANDROID_RELEASE_PREP.md`; production signing and APPLIQ publishing need separate explicit approval.

## Automated smoke checks
Run `npm run test:smoke` from `android-app/` (requires Node.js). The same tests run before each GitHub APK build. They check source/config invariants only and cannot simulate actual photo permissions, device persistence, PNG generation or user interactions.

- The app header displays `BETA V1.1.4` to help identify the newly installed test build.

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
