# VivahSutra — APPLIQ release preparation (DRAFT, NOT PUBLISHED)

## Proposed store listing (editable)
- **App title:** VivahSutra
- **Version in development:** 1.1.0 (Android versionCode 2)
- **Category:** Lifestyle / Wedding invitations (confirm available APPLIQ category before listing)
- **Short description:** Create beautiful Indian wedding invitations on your phone.
- **Full description:** Choose from six wedding invitation designs, personalise the couple's names, celebration details and optional photos, and preview the front and back of your card. Save drafts privately on your Android device. Export your invitation as a PNG or share it through Android's share menu. Includes Hindi and English invitation editing options. No account or payment is required for this free beta.
- **Pricing:** Free beta — no in-app purchases.
- **Audience:** People creating their own wedding or celebration invitations.
- **Features:** Six designs, four accent colours, seven occasions, Hindi/English text entry, optional couple photos, front/back card, local drafts, watermarked PNG share/save.
- **Known limitations:** FREE BETA watermark on exported cards, no device-to-device draft sync, no automatic recovery if app data is cleared or uninstalled. Only the currently selected side is exported as PNG at a time.
- **Privacy summary:** The current app code uses local device storage for invitation drafts and copies selected photos to app-local storage. Users choose whether to send PNGs to other apps. No app account, backend upload or payment integration is implemented for the invitation flow. Recheck APK permissions and third-party SDK behavior before final privacy claims.
- **Support/contact:** NOT PROVIDED — owner must supply verified support contact prior to public listing.
- **Privacy policy URL:** NOT PROVIDED — owner must approve and publish an accurate policy before public listing.
- **Screenshots/icon:** NOT APPROVED — prepare only from approved final device captures; never use fabricated proof of features.

## Test APK vs public release
The GitHub Actions `VivahSutra-Android-Test-APK` artifact is for internal testing; its generated Android release configuration uses debug signing. **Do not upload this as a production APK.** A production signing key must be created in a secure private location, backed up by the owner and never committed to the repository or exposed in logs. Verify application ID and upgrade compatibility before distributing.

## Remaining release gates
1. Latest feature-branch GitHub Actions compile and smoke checks succeed; nonempty APK artifact exists.
2. Owner installs the **latest** APK and tests all six templates plus category filters.
3. Test Hindi fonts and label editing, very long names, one-line and multiline input, and small Android screen behavior.
4. Test optional photos, gallery permission denial, app reopen, local draft changes, deletion confirmation and storage recovery behavior.
5. Test front/back PNG save and share on Android; inspect resulting files and watermark.
6. Confirm privacy disclosure and a valid owner-controlled support address.
7. Create/secure production signing credentials out of band; build and verify a release-signed APK/AAB.
8. Confirm APPLIQ uploads, file hosting, delivery, listing, downloads and installation actually work.
9. Obtain **separate explicit approval** to merge PR #33 into main.
10. Obtain **separate explicit approval** to publish VivahSutra on APPLIQ.

No APPLIQ listing or release is created by this document. The existing root website and its data must not be replaced, modified or deleted.
