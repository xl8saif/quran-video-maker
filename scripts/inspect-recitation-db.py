from pathlib import Path
import json
import sqlite3
import sys
import zipfile

root = Path('public/data/recitations')
zips = sorted(root.rglob('*.db.zip'))
if not zips:
    print('No bundled recitation database archives found.')
    sys.exit(0)

report = []
for archive in zips:
    with zipfile.ZipFile(archive) as zf:
        db_names = [n for n in zf.namelist() if n.lower().endswith('.db')]
        if not db_names:
            report.append({'archive': str(archive), 'error': 'No .db file in archive'})
            continue
        with zf.open(db_names[0]) as source:
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.db') as tmp:
                tmp.write(source.read())
                tmp.flush()
                conn = sqlite3.connect(tmp.name)
                tables = [row[0] for row in conn.execute("select name from sqlite_master where type='table' order by name")]
                table_info = {}
                for table in tables:
                    safe = table.replace('"', '""')
                    columns = [dict(zip(('cid','name','type','notnull','default','pk'), row)) for row in conn.execute(f'pragma table_info("{safe}")')]
                    table_info[table] = columns
                report.append({'archive': str(archive), 'db': db_names[0], 'tables': table_info})
                conn.close()

out = Path('/tmp/qvm-recitation-db-report.json')
out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
for item in report:
    print(f"ARCHIVE: {item['archive']}")
    if 'error' in item:
        print(f"  ERROR: {item['error']}")
        continue
    print(f"  DB: {item['db']}")
    for table, columns in item['tables'].items():
        print(f"  TABLE: {table}")
        print('    COLUMNS: ' + ', '.join(f"{c['name']}:{c['type']}" for c in columns))
