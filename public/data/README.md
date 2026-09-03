# Bundled Quran data

This directory is the organized local data layer for Waraq Quran Reels Maker.

## Layout

```text
public/data/
├── quran/
│   ├── arabic/
│   │   ├── quran-simple-clean.txt
│   │   └── quran-uthmani-min.txt
│   └── translations/
│       ├── ar.muyassar.txt
│       ├── en.daryabadi.txt
│       ├── hi.farooq.txt
│       ├── ko.korean.txt
│       ├── ta.tamil.txt
│       ├── ur.jalandhry.txt
│       ├── ur.junagarhi.txt
│       └── zh.jian.txt
├── fonts/
│   ├── Amiri_Quran.zip
│   ├── Muhammadi Quran font.zip
│   └── Noto_Nastaliq_Urdu.zip
├── mushaf/
│   ├── hafs/pages/
│   └── indopak/
│       ├── indopak-nastaleeq.db.zip
│       ├── indopak.json.zip
│       └── qudratullah-indopak-15-lines.db.zip
├── recitations/
│   ├── ayah/sudais/
│   └── surah/
└── metadata/
    ├── quran-recitation-sources.json
    └── QURAN_DATA_SOURCES.md
```

## Rules

- Keep Arabic Quran text, translations, fonts, Mushaf data, recitations, and metadata in their respective directories.
- Treat bundled files as immutable source assets; application code should reference these stable paths.
- Document redistribution/licensing terms before adding or redistributing third-party assets.
- Tanzil Quran text must remain verbatim and retain the required attribution/license notice.

## Validation

The translation validator checks all 8 bundled translation files for UTF-8 validity, duplicate records, empty entries, and the expected 6,236 ayahs across all 114 surahs.
