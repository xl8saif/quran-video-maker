# Translation assets

Translations are kept separate from the immutable Arabic Quran/Mushaf layer.

Supported application languages:

- English (`en`)
- Urdu (`ur`)
- Arabic (`ar`)

The app may later load a verified/licensed translation JSON file from this directory or accept a user-uploaded translation file through the editor.

Do not bundle a translation merely because it is available online. Verify its redistribution terms first.

The Quran Foundation Content API provides translation resources and also supports offline synchronization of translation resources, but its Content API requires authenticated access. For a zero-hosting-cost GitHub Pages build, only translations with explicit redistribution permission should be committed to this directory.

Source/reference: https://api-docs.quran.foundation/docs/tutorials/content-sync/getting-started/
