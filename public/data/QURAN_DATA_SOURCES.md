# Waraq Quran Reel Maker — Quran data sources

## Arabic Quran text

Tanzil Quran Text is licensed under CC BY 3.0. The text must remain unchanged, Tanzil must be clearly credited, and the Tanzil link must be retained in copies containing substantial portions of the text.

Source: https://tanzil.net/docs/Text_License

## Translations

QuranEnc exposes its translation catalogue through an API and states that its translation contents may be downloaded and re-published only under its stated conditions: no modification/addition/deletion, clear publisher and QuranEnc attribution, version number, transcript information, source notification for notes, updating to the latest version, and no inappropriate advertising.

The app therefore discovers the full available QuranEnc catalogue at runtime rather than pretending that every translation is public domain.

Source: https://quranenc.com/nqo/home/api

## Recitation audio

Recitation is a separate copyrighted sound recording. The app does not bundle arbitrary MP3 collections into the repository.

A whole-Quran Saud Al-Shuraim SoundCloud listing is identified as CC BY and is recorded in `quran-recitation-sources.json` for streaming/reference with attribution.

QuranLab's Quran Audio dataset provides a whole-Quran reference manifest and CC-BY timing data, but explicitly does not host audio bytes for the reference-only recordings. Those URLs must not be treated as a blanket redistribution license.

Sources:
- https://soundcloud.com/quran-audio-205851837/sets/entire-quran-recited-by-sheikh-saud-shuraim
- https://huggingface.co/datasets/quranlab/quran-audio

QuranicAudio states that its MP3 files are free for personal use but that many files have restrictions preventing commercial use. It is therefore reference-only unless the intended use is personal and the applicable recording permits it.

Source: https://quranicaudio.com/about
