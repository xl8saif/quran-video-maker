# Waraq Quran font assets

Waraq keeps Quran typography local so Quran rendering does not depend on a web-font CDN.

Current repository assets:
- `../Amiri_Quran.zip` — uploaded Amiri Quran font package
- `../Muhammadi Quran font.zip` — uploaded Muhammadi Quran font package
- `../Noto_Nastaliq_Urdu.zip` — uploaded Noto Nastaliq Urdu font package

Required UI/font families:
- Arabic Quran text and Arabic UI: `Amiri Quran`
- Indo-Pak Quran text: `Muhammadi Quran`
- Urdu translation text and Urdu UI: `Noto Nastaliq Urdu`

The ZIP packages are repository-local source assets. The build/runtime font-loading layer must use extracted font files from these packages; the ZIP files themselves are not valid `@font-face` sources.

Do not substitute an unlicensed font package or a remote web-font CDN.