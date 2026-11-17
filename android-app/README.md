# VivahSutra — native Android app (Expo / React Native)
This is a separate Android-first application (Expo SDK 57 / Android API 36). The existing GitHub Pages website in the repository root remains untouched.

## Included in v1.1.1 beta
- Animated royal double-door entrance with a Skip Intro control (no external media needed)
- Home / Designs / Create / My Invitations bottom navigation
- Six new mobile invitation themes and four accent colours
- Wedding, Engagement, Haldi, Mehendi, Sangeet, Reception, Save the Date
- Edit invitation details, optional bride and groom photos, front/back preview
- Local device draft saving, PNG export to Photos and native file sharing
- No account, payment, AI or network required for the invitation flow

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
- An older test APK was installed and recorded on an Android device; latest v1.1.1 patches (Hindi editor, local storage safety, accessibility, export layout) **still require fresh device retesting**. A successful CI build does not verify runtime features.

## Upgrading your existing test APK safely
1. Use the latest successful workflow run from the feature branch; download `VivahSutra-Android-Test-APK` from **Artifacts**.
2. Try installing the new APK **over** the existing VivahSutra app. The package is `com.vivahsutra.invites`; v1.1.1 uses Android `versionCode` 3.
3. **Do not uninstall or clear app storage** to resolve an installation conflict without first protecting any local invitation drafts. They are not cloud-backed or migrated.
4. Test all six templates, editing in Hindi, Save/Edit/Reopen, optional photos, and front/back PNG save and share on the actual phone. The exported image has a FREE BETA watermark.
5. The test APK is **not** production-signed. For store distribution, see `../APPLIQ_ANDROID_RELEASE_PREP.md`; production signing and APPLIQ publishing need separate explicit approval.

## Automated smoke checks
Run `npm run test:smoke` from `android-app/` (requires Node.js). The same tests run before each GitHub APK build. They check source/config invariants only and cannot simulate actual photo permissions, device persistence, PNG generation or user interactions.

- The app header displays `BETA V1.1.1` to help identify the newly installed test build.
