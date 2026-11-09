"""Bundle the Arabic identity, font provenance, and applicable licenses."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

ROOT = Path(__file__).resolve().parent
FILES = ['README.md', 'brand.css', 'build-assets.py', 'build-loader.mjs',
         'build-kit.py', 'decision.json', 'editable-wordmark.svg', 'fonts.css',
         'index.html', 'index-en.html', 'palette.json']
PREVIEWS = ['arabic-wordmark.html', 'arabic-wordmark.png', 'arabic-dark-specimen.png',
            'brand-board-desktop.png', 'brand-board-mobile.png', 'brand-cover.png']
FAMILIES = ['arefruqaa', 'ibmplexsans', 'ibmplexsansarabic']
paths = [ROOT / name for name in FILES]
paths += sorted((ROOT / 'assets').glob('*'))
paths += [ROOT / 'previews' / name for name in PREVIEWS]
for family in FAMILIES:
    paths += sorted((ROOT / 'third-party' / family).glob('*'))
manifest = json.loads((ROOT / 'third-party/sources.json').read_text())
manifest['assets'] = [entry for entry in manifest['assets'] if entry['family'] in FAMILIES]
with ZipFile(ROOT / 'hawiyah-brand-kit.zip', 'w', ZIP_DEFLATED) as archive:
    for name in ['LICENSE', 'NOTICE']:
        archive.write(ROOT.parent / name, 'hawiyah-brand-kit/' + name)
    for path in paths:
        archive.write(path, 'hawiyah-brand-kit/' + str(path.relative_to(ROOT)))
    archive.writestr('hawiyah-brand-kit/third-party/sources.json',
                     json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
with ZipFile(ROOT / 'hawiyah-brand-kit.zip') as archive:
    assert archive.testzip() is None
    print(f'Current Arabic-only kit: {len(archive.namelist())} files.')
