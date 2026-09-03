#!/usr/bin/env python3
import json
import sqlite3
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RECITATIONS = ROOT / 'public' / 'data' / 'recitations'
OUT = RECITATIONS / 'timings.json'


def normalize_segments(raw, verse_key):
    if not raw:
        return []
    try:
        value = json.loads(raw) if isinstance(raw, str) else raw
    except (TypeError, json.JSONDecodeError):
        return []
    result = []
    if not isinstance(value, list):
        return result
    for segment in value:
        if not isinstance(segment, (list, tuple)) or len(segment) < 3:
            continue
        try:
            word_index = int(segment[0])
            start_ms = int(segment[1])
            end_ms = int(segment[2])
        except (TypeError, ValueError):
            continue
        if end_ms >= start_ms:
            result.append({
                'verseKey': verse_key,
                'wordIndex': word_index,
                'startMs': start_ms,
                'endMs': end_ms,
            })
    return result


def inspect_db(archive):
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(archive) as zf:
            db_names = [n for n in zf.namelist() if n.endswith('.db')]
            if not db_names:
                return []
            db_path = Path(tmp) / Path(db_names[0]).name
            db_path.write_bytes(zf.read(db_names[0]))
        con = sqlite3.connect(db_path)
        con.row_factory = sqlite3.Row
        try:
            tables = {r['name'] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            rows = []
            if 'segments' in tables:
                for row in con.execute('SELECT surah_number, ayah_number, duration_sec, timestamp_from, timestamp_to, segments FROM segments ORDER BY surah_number, ayah_number'):
                    key = f"{row['surah_number']}:{row['ayah_number']}"
                    rows.append({
                        'verseKey': key,
                        'startMs': int(row['timestamp_from'] or 0),
                        'endMs': int(row['timestamp_to'] or 0),
                        'segments': normalize_segments(row['segments'], key),
                    })
            elif 'verses' in tables:
                for row in con.execute('SELECT surah_number, ayah_number, duration, segments FROM verses ORDER BY surah_number, ayah_number'):
                    key = f"{row['surah_number']}:{row['ayah_number']}"
                    duration = int(row['duration'] or 0)
                    rows.append({
                        'verseKey': key,
                        'startMs': 0,
                        'endMs': duration,
                        'segments': normalize_segments(row['segments'], key),
                    })
            return rows
        finally:
            con.close()


def main():
    manifest = {}
    for archive in sorted(RECITATIONS.rglob('*.db.zip')):
        rel = archive.relative_to(RECITATIONS).as_posix()
        # Stable identifier derived from the archive path; runtime maps it to a reciter.
        manifest[rel] = inspect_db(archive)
    OUT.write_text(json.dumps({'version': 1, 'sources': manifest}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    total = sum(len(v) for v in manifest.values())
    print(f'Prepared local recitation timing manifest: {OUT} ({len(manifest)} databases, {total} ayah rows)')


if __name__ == '__main__':
    main()
