# Quran data

This directory is reserved for the verified production Quran text dataset.

## Source

The production Arabic text must be the **Tanzil Uthmani** text, Version 1.1, copied verbatim. Do not normalize, clean, re-spell, or otherwise modify the Quran text during import.

Official source: https://tanzil.net/download/

The importer should preserve the original ayah boundaries and map each record to a stable `surah:ayah` key.

## License / attribution

Tanzil Quran Text
Copyright (C) 2007-2021 Tanzil Project
License: Creative Commons Attribution 3.0

Tanzil permits verbatim copying and distribution for websites/applications provided the source is clearly indicated, a link to https://tanzil.net is provided, and the copyright notice is retained. Changing the text is not allowed.

Full terms: https://tanzil.net/docs/Text_License

## Expected generated file

`data/quran/tanzil-uthmani.json` should contain the verified text in this shape:

```json
{
  "source": "Tanzil Uthmani 1.1",
  "version": "1.1",
  "surahs": [
    {
      "number": 1,
      "ayahs": [
        { "verseKey": "1:1", "text": "..." }
      ]
    }
  ]
}
```

Do not commit a transformed or altered copy under the Tanzil attribution.
