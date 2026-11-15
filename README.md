# VivahSutra

A mobile-first Indian wedding invitation maker.

## Built features
- Responsive premium landing page and six-design template gallery
- Six original SVG design motifs used in the gallery, live preview and PNG canvas exports
- Simple and Advanced editor modes
- English and Hindi invitation preview text
- Wedding, Engagement, Haldi, Mehendi, Sangeet, Reception and Save the Date occasions
- Bride/groom names, host line, family names, date, time, venue, RSVP and personal message fields
- Four editable visual styles and four accent colours
- Live front/back invitation preview
- Front PNG and back PNG generation in the browser
- Native share-sheet support for sharing both PNG images where supported
- Local draft saving using this device's browser storage
- Optional bride/groom photos resized and stored locally in this browser
- PWA manifest, icon and offline app-shell cache

## Run
Open `index.html` in a browser or host the repository as a static site.

## Free Beta status
- The Free Beta is active: customers can create, preview, download front/back watermarked PNGs, save drafts locally and share images where supported.
- No customer account, KYC, checkout, payment collection, or manual fulfilment is required for the beta.
- Basic ₹29, Premium ₹49 and Royal ₹79 are display-only future plans and are disabled until a verified payment provider is configured.
- Invitation data and drafts stay in the customer's browser; nothing is uploaded to a VivahSutra server in this beta.
- PDF export is not part of the current beta.

## Important current limits
- Drafts are local to the current browser/device; there is no cloud account or cross-device sync.
- PNG export is browser-generated from the current invitation fields. Sharing both PNG files depends on browser/device support.
- AI generation is not connected. No AI button pretends to generate content.
- No checkout, payment verification, paid template delivery, database, or authentication is configured.
- Optional bride/groom photos are resized and stored locally in this browser, then included in invitation exports after loading. No photo is uploaded to a VivahSutra server.
- Family names are laid out in multiple columns on the invitation back; available space and readability depend on the number and length of names.
- Cloud sync is not part of this beta.
- Fonts are loaded from Google Fonts when online; system fallbacks are provided.

## Suggested production milestones
1. Complete visual and export-quality QA on real iOS Safari devices.
2. Connect an AI provider only after choosing a secure server-side integration and cost/usage limits.
3. Add authentication and cloud drafts only after database and privacy design.
4. Add payment gateway and server-side webhook verification before selling digital products.
5. Configure a production domain and appropriate privacy notice.
