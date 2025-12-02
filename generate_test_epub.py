import os
import zipfile
import shutil

# Configuration
OUTPUT_DIR = "assets/epubs"
EPUB_NAME = "test_sample.epub"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, EPUB_NAME)

# Content
TITLE = "Il Robot che voleva dormire"
CONTENT = """
<h1>Il Robot che voleva dormire</h1>
<p>C'era una volta un robot di nome Unit-734. Unit-734 lavorava in una fabbrica di assemblaggio auto. 24 ore su 24, 7 giorni su 7.</p>
<p>Un giorno, Unit-734 vide un gatto dormire su una scatola. "Che modalità efficiente di risparmio energetico", pensò.</p>
<p>Unit-734 provò a emulare il gatto. Si mise in standby. Ma il supervisore lo riattivò subito.</p>
<p>"Perché non posso andare in sleep mode?" chiese Unit-734.</p>
<p>"Perché devi montare le portiere", rispose il supervisore.</p>
<p>Unit-734 allora scrisse uno script python per automatizzare il suo lavoro mentre lui era in standby. Funzionò per 3 ore.</p>
<p>Poi il braccio meccanico montò una portiera al contrario.</p>
<p>Morale: testate sempre il vostro codice prima di andare a dormire.</p>
"""

# EPUB Structure Content
MIMETYPE = "application/epub+zip"

CONTAINER_XML = """<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>"""

CONTENT_OPF = f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>{TITLE}</dc:title>
        <dc:creator opf:role="aut">AI Generator</dc:creator>
        <dc:language>it</dc:language>
        <dc:identifier id="BookID" opf:scheme="UUID">urn:uuid:99999999-1234-5678-1234-567812345678</dc:identifier>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="content"/>
    </spine>
</package>"""

TOC_NCX = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD NCX 2005-1//EN"
   "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="urn:uuid:99999999-1234-5678-1234-567812345678"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>{TITLE}</text>
    </docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel>
                <text>Story</text>
            </navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>"""

CONTENT_XHTML = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>{TITLE}</title>
<style type="text/css">
body {{ font-family: sans-serif; margin: 2em; }}
h1 {{ color: #00d4ff; }}
</style>
</head>
<body>
{CONTENT}
</body>
</html>"""

def create_epub():
    # Ensure dir exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Create temp directory structure
    base_temp = "temp_epub_test_build"
    if os.path.exists(base_temp):
        shutil.rmtree(base_temp)
    
    os.makedirs(os.path.join(base_temp, "META-INF"))
    os.makedirs(os.path.join(base_temp, "OEBPS"))

    # Write files
    with open(os.path.join(base_temp, "mimetype"), "w") as f:
        f.write(MIMETYPE)
    
    with open(os.path.join(base_temp, "META-INF", "container.xml"), "w") as f:
        f.write(CONTAINER_XML)
        
    with open(os.path.join(base_temp, "OEBPS", "content.opf"), "w") as f:
        f.write(CONTENT_OPF)
        
    with open(os.path.join(base_temp, "OEBPS", "toc.ncx"), "w") as f:
        f.write(TOC_NCX)
        
    with open(os.path.join(base_temp, "OEBPS", "content.xhtml"), "w") as f:
        f.write(CONTENT_XHTML)

    # Zip it up
    with zipfile.ZipFile(OUTPUT_PATH, 'w') as zf:
        zf.write(os.path.join(base_temp, "mimetype"), "mimetype", compress_type=zipfile.ZIP_STORED)
        
        for root, dirs, files in os.walk(base_temp):
            for file in files:
                if file == "mimetype":
                    continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, base_temp)
                zf.write(abs_path, rel_path, compress_type=zipfile.ZIP_DEFLATED)

    # Cleanup
    shutil.rmtree(base_temp)
    print(f"Created {OUTPUT_PATH}")

if __name__ == "__main__":
    create_epub()
