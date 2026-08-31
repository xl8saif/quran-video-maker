# Static Quran data

This directory is reserved for verified, licensed Quran/Mushaf datasets that may legally be redistributed with this GitHub Pages application.

## Current policy

Do not place an Indo-Pak/Muhammadi Quran font, page images, or text dataset here unless its redistribution permission is documented. Some IndoPak resources explicitly prohibit redistribution.

The application therefore treats these files as optional assets and shows an unavailable-state when they are not present.

## Planned layout

```text
public/data/
  mushaf/
    hafs/
      pages/1.json
      pages/2.json
      ...
    indo-pak/
      pages/1.json
      pages/2.json
      ...
  translations/
    en/
      <licensed-resource>.json
    ur/
      <licensed-resource>.json
    ar/
      <licensed-resource>.json
```

Each Mushaf page JSON should conform to the `StaticQuranPage` / `StaticQuranWord` types in `src/staticDataProvider.ts`.

## Tanzil attribution

If Tanzil Quran text is used, it must be distributed verbatim with the required Tanzil copyright/license notice and attribution. Tanzil permits use in websites and applications under CC BY 3.0, provided the source is clearly indicated and a link to Tanzil is included. The Quran text must not be changed.

Source: https://tanzil.net/docs/Text_License
