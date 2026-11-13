# VivahSutra

A mobile-first Indian wedding invitation maker.

## Built features
- Responsive premium landing page and template gallery
- Simple and Advanced editor modes
- English and Hindi invitation preview text
- Wedding, engagement, Haldi, Mehendi, Sangeet, reception and Save the Date occasions
- Bride/groom names, host line, date, time, venue, RSVP and personal message fields
- Four editable visual styles and four accent colours
- Local draft saving using this device's browser storage
- PNG invitation generation in the browser
- Print-to-PDF flow and native share-sheet support where the browser supports it
- PWA manifest, icon and offline app-shell cache

## Run
Open `index.html` in a browser or host the repository as a static site.

## Important current limits
- Drafts are local to the current browser/device; there is no cloud account or cross-device sync.
- PNG export is browser-generated from the current invitation fields. PDF uses the browser/iOS print flow.
- AI generation is not connected. No AI button pretends to generate content.
- No checkout, payment verification, paid template delivery, database, or authentication is configured.
- Fonts are loaded from Google Fonts when online; system fallbacks are provided.

## Suggested production milestones
1. Add a real template asset library and export-quality typography/layout QA.
2. Connect an AI provider only after choosing a secure server-side integration and cost/usage limits.
3. Add authentication and cloud drafts only after database and privacy design.
4. Add payment gateway and server-side webhook verification before selling digital products.
5. Configure a production domain, analytics/privacy notice, and test the app on iOS Safari.
