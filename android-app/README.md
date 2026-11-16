# VivahSutra — native Android app (Expo / React Native)
This is a separate Android-first application (Expo SDK 57 / Android API 36). The existing GitHub Pages website in the repository root remains untouched.

## Included in v1
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
Use Expo Go for development where compatible. For an actual standalone Android test APK, the repository workflow **Android APK (manual)** invokes Expo prebuild then Gradle assembleRelease with a **debug-signing key**. This build is for testing only, **not** a production-signed app. APPLIQ listing is a separate process.

## Important notes
- The prior website's localStorage drafts do **not** sync into this app. No existing user data are deleted.
- App drafts/photos are local only. App removal or clearing storage may delete them.
- PNG output includes a **FREE BETA** watermark; no paid feature is represented as active.
- Photos never leave the device. Android image library and media permission handling should be QA-tested.
- No production release signing, app-store publication, or APPLIQ upload is performed automatically.
- The native Android app has not yet been verified on a real device.
